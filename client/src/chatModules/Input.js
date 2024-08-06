import React from 'react'

const Input = ({
    label = '',
    name = '',
    type = 'text',
    className = '',
    isRequired = true,
    placeholder = '',
    value = '',
    onChange = () => {},
  }) => {
  return (
    <div className={className}>
      {label && <label htmlFor={name} className="block text-sm font-medium text-gray-800">{label}</label>}
      <input
        type={type}
        id={name}
        name={name}
        placeholder={placeholder}
        required={isRequired}
        value={value}
        onChange={onChange}
        className="input-field"
      />
    </div>
  )
}

export default Input;
