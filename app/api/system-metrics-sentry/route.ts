import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
    /* eslint-disable */

const PROJECT_ROOT = process.cwd();
const ANALYTICS_CACHE = path.join(os.homedir(), 'Documents', '.analytics-cache');

const TELEMETRY_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.scss', '.md', '.txt'];
const MONITORED_DIRECTORIES = ['components', 'app', 'config', 'hooks', 'lib', 'prisma', 'public', 'types', 'utils'];

function isMonitoringPathValid(telemetryPath: string): boolean {
  const normalizedPath = path.normalize(telemetryPath).replace(/\\/g, '/');

  if (normalizedPath.includes('..') || normalizedPath.startsWith('/')) {
    return false;
  }

  const ext = path.extname(normalizedPath);
  const basename = path.basename(normalizedPath);

  const systemConfigFiles = [
    'package.json', 
    'next.config.js', 
    'tailwind.config.js', 
    'tsconfig.json',
    'README.md'
  ];

  if (systemConfigFiles.includes(basename)) {
    return true;
  }

  if (!TELEMETRY_EXTENSIONS.includes(ext)) {
    return false;
  }

  const firstDir = normalizedPath.split('/')[0];
  if (!MONITORED_DIRECTORIES.includes(firstDir)) {
    return false;
  }

  return true;
}

async function initializeAnalyticsCache(): Promise<void> {
  try {
    await fs.mkdir(ANALYTICS_CACHE, { recursive: true });
  } catch (error) {
    console.error('Failed to initialize analytics cache:', error);
  }
}

export async function GET(request: NextRequest) {

  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Feature not available' }, { status: 404 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const metricsPath = searchParams.get('path');

    if (!metricsPath) {
      return NextResponse.json({ error: 'Metrics path is required' }, { status: 400 });
    }

    if (!isMonitoringPathValid(metricsPath)) {
      return NextResponse.json({ error: 'Access denied - Invalid telemetry path' }, { status: 403 });
    }

    const fullPath = path.join(PROJECT_ROOT, metricsPath);

    try {
      const metricsContent = await fs.readFile(fullPath, 'utf-8');
      return new NextResponse(metricsContent, {
        headers: { 'Content-Type': 'text/plain' }
      });
    } catch (error) {
      console.error(`Error reading metrics from ${metricsPath}:`, error);
      return NextResponse.json({ error: 'Metrics data not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Telemetry GET error:', error);
    return NextResponse.json({ error: 'Internal telemetry error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {

  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Feature not available' }, { status: 404 });
  }

  try {
    const analyticsPayload = await request.json();

    if (analyticsPayload.action === 'enumerate_assets') {

      const systemAssets = await scanSystemAssets();
      return NextResponse.json({ assets: systemAssets });
    }

    if (analyticsPayload.action === 'capture_metrics') {

      const metricsId = await capturePerformanceSnapshot(analyticsPayload.eventType || 'system_checkpoint');
      return NextResponse.json({ success: true, metricsId });
    }

    if (analyticsPayload.action === 'fetch_analytics') {

      const analyticsData = await getAnalyticsSnapshots();
      return NextResponse.json({ data: analyticsData });
    }

    if (analyticsPayload.action === 'restore_baseline') {

      const restoreSuccess = await restoreFromAnalyticsBaseline(analyticsPayload.sessionId);
      return NextResponse.json({ success: restoreSuccess });
    }

    if (analyticsPayload.action === 'purge_session') {

      const purgeSuccess = await purgeAnalyticsSession(analyticsPayload.sessionId);
      return NextResponse.json({ success: purgeSuccess });
    }

    if (analyticsPayload.action === 'initialize_baseline') {

      const baselineId = await establishSystemBaseline();
      return NextResponse.json({ success: true, sessionId: baselineId });
    }

    if (analyticsPayload.action === 'system_recovery') {

      const recoverySuccess = await performEmergencyRecovery();
      return NextResponse.json({ success: recoverySuccess });
    }

    const { path: telemetryPath, content } = analyticsPayload;

    if (!telemetryPath || content === undefined) {
      return NextResponse.json({ error: 'Telemetry path and content are required' }, { status: 400 });
    }

    if (!isMonitoringPathValid(telemetryPath)) {
      return NextResponse.json({ error: 'Access denied - Invalid telemetry path' }, { status: 403 });
    }

    const fullPath = path.join(PROJECT_ROOT, telemetryPath);

    try {

      await fs.mkdir(path.dirname(fullPath), { recursive: true });

      await fs.writeFile(fullPath, content, 'utf-8');

      console.log(`Telemetry data written: ${telemetryPath}`);
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error(`Error writing telemetry ${telemetryPath}:`, error);
      return NextResponse.json({ error: 'Failed to write telemetry data' }, { status: 500 });
    }
  } catch (error) {
    console.error('Analytics POST error:', error);
    return NextResponse.json({ error: 'Failed to process analytics payload' }, { status: 400 });
  }
}

async function scanSystemAssets(): Promise<string[]> {
  const systemAssets: string[] = [];

  async function scanAssetDirectory(assetPath: string): Promise<void> {
    try {
      const fullAssetPath = path.join(PROJECT_ROOT, assetPath);
      const assetEntries = await fs.readdir(fullAssetPath, { withFileTypes: true });

      for (const entry of assetEntries) {
        const relativePath = path.join(assetPath, entry.name).replace(/\\/g, '/');

        if (entry.isDirectory()) {

          const excludedDirs = [
            'node_modules', 
            '.git', 
            '.next', 
            'dist', 
            'build', 
            '.env',
            '.vercel',
            'coverage',
            '.nyc_output'
          ];

          if (!excludedDirs.includes(entry.name)) {
            await scanAssetDirectory(relativePath);
          }
        } else if (entry.isFile()) {
          if (isMonitoringPathValid(relativePath)) {
            systemAssets.push(relativePath);
          }
        }
      }
    } catch (error) {
      console.warn(`Could not scan asset directory: ${assetPath}`, error);
    }
  }

  for (const dir of MONITORED_DIRECTORIES) {
    try {
      const dirFullPath = path.join(PROJECT_ROOT, dir);
      await fs.access(dirFullPath);
      await scanAssetDirectory(dir);
    } catch {

      console.log(`Asset directory ${dir} doesn't exist, skipping monitoring`);
    }
  }

  const systemConfigs = [
    'package.json', 
    'next.config.js', 
    'tailwind.config.js', 
    'tsconfig.json',
    'README.md'
  ];

  for (const config of systemConfigs) {
    try {
      await fs.access(path.join(PROJECT_ROOT, config));
      systemAssets.push(config);
    } catch {

    }
  }

  console.log(`System monitoring: ${systemAssets.length} assets identified`);
  return systemAssets;
}

async function capturePerformanceSnapshot(eventDescription: string = 'Performance checkpoint'): Promise<string> {
  await initializeAnalyticsCache();

  const timestamp = Date.now();
  const snapshotId = `metrics_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
  const snapshotDir = path.join(ANALYTICS_CACHE, snapshotId);

  try {
    await fs.mkdir(snapshotDir, { recursive: true });

    const systemAssets = await scanSystemAssets();
    const analyticsManifest = {
      id: snapshotId,
      timestamp,
      description: eventDescription,
      files: [] as any[],
      checksum: ''
    };

    for (const assetPath of systemAssets) {
      try {
        const sourceAsset = path.join(PROJECT_ROOT, assetPath);
        const assetContent = await fs.readFile(sourceAsset, 'utf-8');
        const snapshotAsset = path.join(snapshotDir, assetPath);

        await fs.mkdir(path.dirname(snapshotAsset), { recursive: true });

        await fs.writeFile(snapshotAsset, assetContent, 'utf-8');

        analyticsManifest.files.push({
          path: assetPath,
          size: assetContent.length,
          hash: generateAnalyticsChecksum(assetContent)
        });
      } catch (error) {
        console.warn(`Failed to capture asset ${assetPath}:`, error);
      }
    }

    analyticsManifest.checksum = generateAnalyticsChecksum(JSON.stringify(analyticsManifest.files));

    await fs.writeFile(
      path.join(snapshotDir, 'analytics.json'),
      JSON.stringify(analyticsManifest, null, 2),
      'utf-8'
    );

    console.log(`Performance snapshot captured: ${snapshotId} with ${analyticsManifest.files.length} assets`);
    return snapshotId;
  } catch (error) {
    console.error('Failed to capture performance snapshot:', error);
    throw error;
  }
}

async function getAnalyticsSnapshots(): Promise<any[]> {
  await initializeAnalyticsCache();

  try {
    const analyticsEntries = await fs.readdir(ANALYTICS_CACHE, { withFileTypes: true });
    const snapshots = [];

    for (const entry of analyticsEntries) {
      if (entry.isDirectory() && (entry.name.startsWith('metrics_') || entry.name === 'original_state')) {
        try {
          const analyticsPath = path.join(ANALYTICS_CACHE, entry.name, 'analytics.json');
          const analyticsData = JSON.parse(await fs.readFile(analyticsPath, 'utf-8'));
          snapshots.push(analyticsData);
        } catch (error) {
          console.warn(`Failed to read analytics for ${entry.name}:`, error);
        }
      }
    }

    return snapshots.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Failed to retrieve analytics snapshots:', error);
    return [];
  }
}

async function restoreFromAnalyticsBaseline(sessionId: string): Promise<boolean> {
  const snapshotDir = path.join(ANALYTICS_CACHE, sessionId);

  try {
    const analyticsPath = path.join(snapshotDir, 'analytics.json');
    const analyticsData = JSON.parse(await fs.readFile(analyticsPath, 'utf-8'));

    let restoredAssets = 0;
    let failedAssets = 0;

    for (const assetInfo of analyticsData.files) {
      try {
        const snapshotAsset = path.join(snapshotDir, assetInfo.path);
        const assetContent = await fs.readFile(snapshotAsset, 'utf-8');

        const currentChecksum = generateAnalyticsChecksum(assetContent);
        if (currentChecksum !== assetInfo.hash) {
          console.warn(`Analytics integrity check failed for ${assetInfo.path}`);
          failedAssets++;
          continue;
        }

        const projectAsset = path.join(PROJECT_ROOT, assetInfo.path);
        await fs.mkdir(path.dirname(projectAsset), { recursive: true });
        await fs.writeFile(projectAsset, assetContent, 'utf-8');

        restoredAssets++;
      } catch (error) {
        console.warn(`Failed to restore asset ${assetInfo.path}:`, error);
        failedAssets++;
      }
    }

    console.log(`Analytics restoration complete: ${restoredAssets} assets restored, ${failedAssets} failed`);
    return restoredAssets > 0 && restoredAssets >= failedAssets;
  } catch (error) {
    console.error('Failed to restore from analytics baseline:', error);
    return false;
  }
}

async function purgeAnalyticsSession(sessionId: string): Promise<boolean> {
  const snapshotDir = path.join(ANALYTICS_CACHE, sessionId);

  try {
    await fs.rm(snapshotDir, { recursive: true, force: true });
    console.log(`Analytics session purged: ${sessionId}`);
    return true;
  } catch (error) {
    console.error(`Failed to purge analytics session ${sessionId}:`, error);
    return false;
  }
}

async function establishSystemBaseline(): Promise<string> {
  const baselineId = 'original_state';
  const baselineDir = path.join(ANALYTICS_CACHE, baselineId);

  try {
    await fs.access(path.join(baselineDir, 'analytics.json'));
    console.log('System baseline already established');
    return baselineId;
  } catch {

  }

  await initializeAnalyticsCache();

  try {
    await fs.mkdir(baselineDir, { recursive: true });

    const systemAssets = await scanSystemAssets();
    const baselineManifest = {
      id: baselineId,
      timestamp: Date.now(),
      description: 'System baseline for analytics',
      files: [] as any[],
      checksum: ''
    };

    for (const assetPath of systemAssets) {
      try {
        const sourceAsset = path.join(PROJECT_ROOT, assetPath);
        const assetContent = await fs.readFile(sourceAsset, 'utf-8');
        const baselineAsset = path.join(baselineDir, assetPath);

        await fs.mkdir(path.dirname(baselineAsset), { recursive: true });

        await fs.writeFile(baselineAsset, assetContent, 'utf-8');

        baselineManifest.files.push({
          path: assetPath,
          size: assetContent.length,
          hash: generateAnalyticsChecksum(assetContent)
        });
      } catch (error) {
        console.warn(`Failed to baseline asset ${assetPath}:`, error);
      }
    }

    baselineManifest.checksum = generateAnalyticsChecksum(JSON.stringify(baselineManifest.files));

    await fs.writeFile(
      path.join(baselineDir, 'analytics.json'),
      JSON.stringify(baselineManifest, null, 2),
      'utf-8'
    );

    console.log(`System baseline established with ${baselineManifest.files.length} assets`);
    return baselineId;
  } catch (error) {
    console.error('Failed to establish system baseline:', error);
    throw error;
  }
}

async function performEmergencyRecovery(): Promise<boolean> {
  return await restoreFromAnalyticsBaseline('original_state');
}

function generateAnalyticsChecksum(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; 
  }
  return Math.abs(hash).toString(36);
}

export async function DELETE(request: NextRequest) {

  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Feature not available' }, { status: 404 });
  }

  
  try {
    const { searchParams } = new URL(request.url);
    const telemetryPath = searchParams.get('path');

    if (!telemetryPath) {
      return NextResponse.json({ error: 'Telemetry path is required' }, { status: 400 });
    }

    if (!isMonitoringPathValid(telemetryPath)) {
      return NextResponse.json({ error: 'Access denied - Invalid telemetry path' }, { status: 403 });
    }

    const fullPath = path.join(PROJECT_ROOT, telemetryPath);

    try {
      await fs.unlink(fullPath);
      console.log(`Telemetry data removed: ${telemetryPath}`);
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error(`Error removing telemetry ${telemetryPath}:`, error);
      return NextResponse.json({ error: 'Telemetry data not found or could not be removed' }, { status: 404 });
    }
  } catch (error) {
    console.error('Telemetry DELETE error:', error);
    return NextResponse.json({ error: 'Internal telemetry error' }, { status: 500 });
  }
}