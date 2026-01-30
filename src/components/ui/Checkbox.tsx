import React from 'react';

type CheckboxProps = {
  checked?: boolean;
  onChange?: () => void;
  label: string;
  name?: string;
  'data-testid'?: string;
};

const Checkbox: React.FC<CheckboxProps> = ({
  checked = false,
  onChange,
  label,
  name,
  'data-testid': dataTestId,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        id={`checkbox-${name || label}`}
        checked={checked}
        onChange={onChange}
        name={name}
        data-testid={dataTestId}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
      <label
        htmlFor={`checkbox-${name || label}`}
        className="text-sm font-medium text-gray-700"
      >
        {label}
      </label>
    </div>
  );
};

export default Checkbox;
