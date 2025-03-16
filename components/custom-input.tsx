import React from 'react'
import { Control } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';

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

export default CustomInput