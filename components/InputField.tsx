
interface InputFieldProps {
  type?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

export default function InputField({
  type = "text",
  placeholder,
  value,
  onChange,
}: InputFieldProps) {
  return (
    <input
      className="input"
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}