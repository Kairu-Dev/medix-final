import React from 'react'
import { Control } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Switch } from './ui/switch';

interface CustomProps {
  type: "input" | "select" | "checkbox" | "switch" | "radio" | "textarea";
  control: Control<any>;
  name: string;
  label?: string;
  placeholder?: string;
  inputType?: "text" | "email" | "password" | "date";
  selectList?: { label: string; value: string }[];
  defaultValue?: string;
}

const RenderInput = ({ field, props }: {field: any; props: CustomProps}) => {
  switch (props.type) {
    case "input":
        return (
            <FormControl>

                <Input 
                className="shad-input" //Remove border-0 need to fix auto highlight when field is selected
                type={props.inputType}
                placeholder={props.placeholder}
                {...field}
                
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
};
interface SwitchProps {
  data: { label: string; value: string }[];
  setWorkSchedule: React.Dispatch<React.SetStateAction<Day[]>>;
}

export const SwitchInput = ({ data, setWorkSchedule }: SwitchProps) => {
  const handleChange = (day: string, field: any, value: string) => {
    setWorkSchedule((prevDays) => {
      const dayExist = prevDays.find((d) => d.day === day);

      if (dayExist) {
        return prevDays.map((d) =>
          d.day === day ? { ...d, [field]: value } : d
        );
      } else {
        if (field === true) {
          return [
            ...prevDays,
            { day, start_time: "09:00", close_time: "17:00" },
          ];
        } else {
          return [...prevDays, { day, [field]: value }];
        }
      }
    });
  };

  return (
    <div className="space-y-1 mt-2">
      {data?.map((el, id) => (
        <div
          key={id}
          className="w-full flex items-center space-y-3 border-t border-emerald-500/20 py-4 hover:bg-emerald-900/10 transition-all rounded-md px-1"
        >
          <Switch
            id={el.value}
            className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-400 border-emerald-300/50 peer [&>span]:bg-emerald-200/80"
            onCheckedChange={(e) => handleChange(el.value, true, "09:00")}
          />
          <Label htmlFor={el.value} className="w-20 capitalize text-emerald-100 font-medium ml-2">
            {el.value}
          </Label>

          <Label className="text-emerald-400/60 text-sm font-light italic peer-data-[state=checked]:hidden pl-10">
            Not working on this day
          </Label>

          <div className="hidden peer-data-[state=checked]:flex items-center gap-2 pl-6">
            <Input
              name={`${el.label}.start_time`}
              type="time"
              defaultValue="09:00"
              onChange={(e) =>
                handleChange(el.value, "start_time", e.target.value)
              }
              className="bg-emerald-900/30 border-emerald-500/30 text-emerald-100"
            />
            <Input
              name={`${el.label}.close_time`}
              type="time"
              defaultValue="17:00"
              onChange={(e) =>
                handleChange(el.value, "close_time", e.target.value)
              }
              className="bg-emerald-900/30 border-emerald-500/30 text-emerald-100"
            />
          </div>
        </div>
      ))}
    </div>
  );
};
{/*
export const SwitchInput = ({ data, setWorkSchedule }: SwitchProps) => {
  const handleChange = (day: string, field: any, value: string) => {
    setWorkSchedule((prevDays) => {
      const dayExist = prevDays.find((d) => d.day === day);

      if (dayExist) {
        return prevDays.map((d) =>
          d.day === day ? { ...d, [field]: value } : d
        );
      } else {
        if (field === true) {
          return [
            ...prevDays,
            { day, start_time: "09:00", close_time: "17:00" },
          ];
        } else {
          return [...prevDays, { day, [field]: value }];
        }
      }
    });
  };

  return (
    <div className="">
      {data?.map((el, id) => (
        <div
          key={id}
          className="w-full flex items-center space-y-3 border-t border-t-gray-200  py-3"
        >
          <Switch
            id={el.value}
            className="data-[state=checked]:bg-green-500 peer"
            onCheckedChange={(e) => handleChange(el.value, true, "09:00")}
          />
          <Label htmlFor={el.value} className="w-20 capitalize">
            {el.value}
          </Label>

          <Label className="text-gray-400 font-normal italic peer-data-[state=checked]:hidden pl-10">
            Not working on this day
          </Label>

          <div className="hidden peer-data-[state=checked]:flex items-center gap-2 pl-6:">
            <Input
              name={`${el.label}.start_time`}
              type="time"
              defaultValue="09:00"
              onChange={(e) =>
                handleChange(el.value, "start_time", e.target.value)
              }
            />
            <Input
              name={`${el.label}.close_time`}
              type="time"
              defaultValue="17:00"
              onChange={(e) =>
                handleChange(el.value, "close_time", e.target.value)
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
};
*/}

export default CustomInput