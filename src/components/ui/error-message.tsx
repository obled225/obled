interface ErrorMessageProps {
  error?: string | null;
  className?: string;
  'data-testid'?: string;
}

const ErrorMessage = ({
  error,
  className = '',
  'data-testid': dataTestId,
}: ErrorMessageProps) => {
  if (!error) {
    return null;
  }

  return (
    <div
      className={`text-red-600 text-sm ${className}`}
      data-testid={dataTestId}
    >
      {error}
    </div>
  );
};

export default ErrorMessage;
