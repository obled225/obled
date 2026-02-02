import { ChevronDown, Phone } from 'lucide-react';
import { cn } from '@/lib/actions/utils';
import React, { useEffect, useCallback, useRef } from 'react';
import * as RPNInput from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';
import { isValidPhoneNumber } from 'react-phone-number-input';
import { useCountryDetection } from '@/lib/hooks/checkout/use-country-detection';
import { countryCodeToName } from '@/lib/utils/country-helpers';

interface PhoneNumberInputProps {
  value: string;
  onChange: (value: string | undefined) => void;
  onCountryChange?: (country: string) => void; // Now expects country name instead of code
  onValidationChange?: (isValid: boolean | undefined) => void;
}

export default function CheckoutPhoneNumberInput({
  value,
  onChange,
  onCountryChange,
  onValidationChange,
}: PhoneNumberInputProps) {
  // Use centralized country detection hook
  const { countryCode: defaultCountry } = useCountryDetection({
    countryCodeKey: 'user_country_code',
    countryNameKey: 'user_country_name',
    fallbackCountryCode: 'CI',
    fallbackCountryName: "Côte d'Ivoire",
  });

  // Debounced validation with minimum character threshold
  const debounceRef = useRef<NodeJS.Timeout>(undefined);

  const validatePhoneNumber = useCallback(
    (phoneValue: string) => {
      if (phoneValue && phoneValue.trim().length >= 7) {
        // Only validate after minimum 7 characters (country code + meaningful number)
        const valid = isValidPhoneNumber(phoneValue);
        onValidationChange?.(valid);
      } else if (phoneValue && phoneValue.trim().length > 0) {
        // For inputs between 1-6 characters, don't validate yet (undefined = no validation)
        onValidationChange?.(undefined);
      } else {
        // Empty input
        onValidationChange?.(false);
      }
    },
    [onValidationChange]
  );

  useEffect(() => {
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce validation by 500ms to avoid validating while user is typing
    debounceRef.current = setTimeout(() => {
      validatePhoneNumber(value);
    }, 500);

    // Cleanup on unmount
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value, validatePhoneNumber]);

  return (
    <div className="space-y-2">
      <div className="relative flex w-full rounded-md border border-input bg-background">
        <RPNInput.default
          className="flex w-full"
          international
          defaultCountry={(defaultCountry || 'CI') as RPNInput.Country}
          flagComponent={FlagComponent}
          countrySelectComponent={CountrySelect}
          inputComponent={PhoneInput}
          placeholder="Phone number"
          value={value}
          onChange={onChange}
          onCountryChange={(countryCode) => {
            // Convert country code to country name before calling parent callback
            const countryName = countryCodeToName(countryCode);
            onCountryChange?.(countryName);
          }}
          onBlur={() => validatePhoneNumber(value)}
          countryCallingCodeEditable={true}
        />
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 pointer-events-none">
          *
        </span>
      </div>
    </div>
  );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const PhoneInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        className={cn(
          'flex h-10 w-full rounded-r-md border-0 bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
        autoComplete="tel"
        data-lpignore="true"
        data-form-type="other"
      />
    );
  }
);

PhoneInput.displayName = 'PhoneInput';

type CountrySelectProps = {
  disabled?: boolean;
  value: RPNInput.Country;
  onChange: (value: RPNInput.Country) => void;
  options: { label: string; value: RPNInput.Country }[];
};

const CountrySelect = ({
  disabled,
  value,
  onChange,
  options,
}: CountrySelectProps) => {
  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value as RPNInput.Country);
  };

  return (
    <div className="relative inline-flex items-center self-stretch h-10 px-3 border-r border-input">
      <div className="inline-flex items-center gap-2" aria-hidden="true">
        <FlagComponent country={value} countryName={value} aria-hidden="true" />
        <span className="text-muted-foreground/80">
          <ChevronDown size={16} strokeWidth={2} aria-hidden="true" />
        </span>
      </div>
      <select
        disabled={disabled}
        value={value || ''}
        onChange={handleSelect}
        className="absolute inset-0 text-sm opacity-0 cursor-pointer"
        aria-label="Select country"
        data-lpignore="true"
      >
        <option value="" className="text-gray-400">
          Select country
        </option>
        {options
          .filter((x) => x.value)
          .map((option) => (
            <option key={option.value || 'empty'} value={option.value}>
              {option.label}{' '}
              {option.value &&
                `+${RPNInput.getCountryCallingCode(option.value)}`}
            </option>
          ))}
      </select>
    </div>
  );
};

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country];

  return (
    <span className="w-5 overflow-hidden rounded-sm" suppressHydrationWarning>
      {Flag ? (
        <Flag title={countryName} />
      ) : (
        <Phone size={16} aria-hidden="true" role="presentation" />
      )}
    </span>
  );
};
