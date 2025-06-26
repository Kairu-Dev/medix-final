import React, { useEffect, useState } from 'react'
import { Control } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import PhoneInput from 'react-phone-number-input'
import { E164Number } from 'libphonenumber-js'
import 'react-phone-number-input/style.css';



import { Switch } from './ui/switch';

/* eslint-disable */

interface CustomProps {
  type: "input" | "select" | "checkbox" | "switch" | "radio" | "textarea" | "phone_input";
  control: Control<any>;
  name: string;
  label?: string;
  placeholder?: string;
  inputType?: "text" | "email" | "password" | "date";
  selectList?: { label: string; value: string }[];
  defaultValue?: string;
  disabled?: boolean;
}

const RenderInput = ({ field, props }: {field: any; props: CustomProps}) => {
  switch (props.type) {
    case "input":
        return (
            <FormControl>
                <Input 
                className="shad-input"
                type={props.inputType}
                placeholder={props.placeholder}
                {...field}
                />
            </FormControl>
        );

    case "phone_input":
      return (
        <FormControl>
          <PhoneInput
            defaultCountry="US"
            placeholder={props.placeholder}
            international
            withCountryCallingCode
            value={field.value as E164Number | undefined}
            onChange={field.onChange}
            className="input-phone"
          />
        </FormControl>
      );

    case "select":
      return (
        <Select onValueChange={field.onChange} value={field?.value}>
          <FormControl>
            <SelectTrigger className="shad-select-trigger">
              <SelectValue placeholder={props.placeholder} />
            </SelectTrigger>
          </FormControl>
          <SelectContent className="shad-select-content">
            {props.selectList?.map((i, id) => (
              <SelectItem key={id} value={i.value}>
                {i.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

      case "checkbox":
  return (
    <div className="flex items-start gap-3 mb-4"> 
      <Checkbox
        id={props.name}
        className="mb-1.5" 
        onCheckedChange={(e) => field.onChange(e === true || null)}
      />
      <div className="grid gap-1.5 leading-normal"> 
        <label
          htmlFor={props.name}
          className="checkbox-label cursor-pointer text-sm font-medium leading-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {props.label}
        </label>
        <p className="text-sm text-muted-foreground">{props.placeholder}</p>
      </div>
    </div>
  );

  case "radio":
    return (
      <div className="w-full">
        <FormLabel className="text-emerald-100 font-medium text-sm tracking-wide mb-2 block">{props.label}</FormLabel>
        <RadioGroup
          defaultValue={props.defaultValue}
          onChange={field.onChange}
          className="flex gap-4"
        >
          {props?.selectList?.map((i, id) => (
            <div className="flex items-center w-full" key={id}>
              <RadioGroupItem
                value={i.value}
                id={i.value}
                className="peer sr-only"
              />
              <Label
                htmlFor={i.value}
                className="flex flex-1 items-center justify-center rounded-md border-2 border-emerald-700 bg-gray-900/70 p-4 font-medium tracking-wide text-emerald-200 transition-all duration-200 
                hover:bg-emerald-900/50 hover:border-emerald-600 hover:text-emerald-100 hover:shadow-md hover:shadow-emerald-900/30
                peer-data-[state=checked]:border-emerald-500 peer-data-[state=checked]:bg-emerald-900/80 peer-data-[state=checked]:text-emerald-100 peer-data-[state=checked]:shadow-lg peer-data-[state=checked]:shadow-emerald-900/40"
              >
                {i.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    );
  
  case "textarea":
    return (
      <FormControl>
        <Textarea
          className="shad-textArea"
          type={props.inputType}
          placeholder={props.placeholder}
          {...field}
        ></Textarea>
      </FormControl>
    );
}
};

export const CustomInput = ( props: CustomProps ) => {
  const { name, label, control, type } = props;
  
  return (
    <FormField
        control={control}
        name={name}
        render={({ field }) => (
            <FormItem className="w-full">
                {type !== "radio" && type !== "checkbox" && (
                    <FormLabel className="shad-input-label">{label}</FormLabel>
                )}
                <RenderInput field={field} props={props} />
                <FormMessage className="shad-error"/>
            </FormItem>
        )}
    />
  );
};

type Day = {
  day: string;
  start_time?: string;
  close_time?: string;
  isActive?: boolean;
};

interface SwitchProps {
  data: { label: string; value: string }[];
  setWorkSchedule: React.Dispatch<React.SetStateAction<Day[]>>;
}

export const SwitchInput = ({ data, setWorkSchedule }: SwitchProps) => {
  // Initialize with all days
  const [days, setDays] = useState<{ [key: string]: Day }>({});

  // Initialize days on component mount
  useEffect(() => {
    const initialDays: { [key: string]: Day } = {};
    data.forEach(item => {
      initialDays[item.value] = { 
        day: item.value, 
        isActive: false,
        start_time: "09:00",
        close_time: "17:00"
      };
    });
    setDays(initialDays);
    
    // Only include active days in the workSchedule (which should be none initially)
    setWorkSchedule([]);
  }, [data, setWorkSchedule]);

  const toggleDay = (day: string, isActive: boolean) => {
    setDays(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        isActive
      }
    }));

    setWorkSchedule(prevSchedule => {
      // If toggling on, add to schedule
      if (isActive) {
        const existingDay = prevSchedule.find(d => d.day === day);
        if (existingDay) {
          return prevSchedule.map(d => 
            d.day === day ? { ...d, isActive: true } : d
          );
        } else {
          return [
            ...prevSchedule,
            { 
              day, 
              isActive: true,
              start_time: "09:00", 
              close_time: "17:00" 
            }
          ];
        }
      } 
      // If toggling off, remove from schedule
      else {
        return prevSchedule.filter(d => d.day !== day);
      }
    });
  };

  const updateTime = (day: string, field: "start_time" | "close_time", value: string) => {
    setDays(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));

    setWorkSchedule(prevSchedule => {
      return prevSchedule.map(d => 
        d.day === day ? { ...d, [field]: value } : d
      );
    });
  };

  return (
    <div className="space-y-1 mt-2">
      {data?.map((el, id) => {
        const dayData = days[el.value] || { day: el.value, isActive: false };
        
        return (
          <div
            key={id}
            className="w-full flex items-center border-t border-emerald-500/20 py-4 hover:bg-emerald-900/10 transition-all rounded-md px-1"
          >
            <Switch
              id={el.value}
              checked={dayData.isActive}
              onCheckedChange={(checked) => toggleDay(el.value, checked)}
              className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-400 border-emerald-300/50 [&>span]:bg-emerald-200/80"
            />
            <Label htmlFor={el.value} className="w-20 capitalize text-emerald-100 font-medium ml-2">
              {el.value}
            </Label>

            {!dayData.isActive && (
              <span className="text-emerald-400/60 text-sm font-light italic pl-10">
                Not working on this day
              </span>
            )}

            {dayData.isActive && (
              <div className="flex items-center gap-2 pl-6">
                <Input
                  name={`${el.value}.start_time`}
                  type="time"
                  value={dayData.start_time || "09:00"}
                  onChange={(e) => updateTime(el.value, "start_time", e.target.value)}
                  className="bg-emerald-900/30 border-emerald-500/30 text-emerald-100"
                />
                <Input
                  name={`${el.value}.close_time`}
                  type="time"
                  value={dayData.close_time || "17:00"}
                  onChange={(e) => updateTime(el.value, "close_time", e.target.value)}
                  className="bg-emerald-900/30 border-emerald-500/30 text-emerald-100"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};