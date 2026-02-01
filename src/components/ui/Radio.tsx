import React from 'react';

type RadioProps = {
  checked: boolean;
  onChange?: () => void;
  name?: string;
  value?: string;
  'data-testid'?: string;
};

const Radio: React.FC<RadioProps> = ({
  checked,
  onChange,
  'data-testid': dataTestId,
}) => {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      data-state={checked ? 'checked' : 'unchecked'}
      onClick={onChange}
      className="group relative flex h-5 w-5 items-center justify-center outline-none"
      data-testid={dataTestId || 'radio-button'}
    >
      <div className="shadow-sm border border-gray-300 group-hover:border-gray-400 bg-white group-data-[state=checked]:bg-blue-600 group-data-[state=checked]:border-blue-600 group-focus:ring-2 group-focus:ring-blue-500 group-focus:ring-offset-2 flex h-4 w-4 items-center justify-center rounded-md transition-all">
        {checked && (
          <span
            data-state={checked ? 'checked' : 'unchecked'}
            className="group flex items-center justify-center"
          >
            <div className="bg-white rounded-md h-1.5 w-1.5"></div>
          </span>
        )}
      </div>
    </button>
  );
};

export default Radio;
