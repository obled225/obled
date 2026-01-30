import React, { useImperativeHandle, useState, useMemo } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type InputProps = Omit<
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
  'placeholder'
> & {
  label: string;
  errors?: Record<string, unknown>;
  touched?: Record<string, unknown>;
  name: string;
  topLabel?: string;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ type, name, label, required, topLabel, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [showPassword, setShowPassword] = useState(false);

    const inputType = useMemo(() => {
      if (type === 'password' && showPassword) {
        return 'text';
      }
      if (type === 'password' && !showPassword) {
        return 'password';
      }
      return type;
    }, [type, showPassword]);

    useImperativeHandle(ref, () => inputRef.current!);

    return (
      <div className="flex flex-col w-full">
        {topLabel && (
          <label className="mb-2 text-sm font-medium text-gray-700">
            {topLabel}
          </label>
        )}
        <div className="flex relative z-0 w-full">
          <input
            type={inputType}
            name={name}
            placeholder=" "
            required={required}
            className="pt-4 pb-1 block w-full h-11 px-4 mt-0 bg-white border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:bg-gray-50 transition-colors"
            {...props}
            ref={inputRef}
          />
          <label
            htmlFor={name}
            onClick={() => inputRef.current?.focus()}
            className="flex items-center justify-center mx-3 px-1 transition-all absolute duration-300 top-3 -z-1 origin-0 text-gray-500 text-sm"
          >
            {label}
            {required && <span className="text-red-500">*</span>}
          </label>
          {type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-500 px-4 focus:outline-none transition-all duration-150 outline-none focus:text-gray-700 absolute right-0 top-3"
            >
              {showPassword ? <Eye /> : <EyeOff />}
            </button>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
