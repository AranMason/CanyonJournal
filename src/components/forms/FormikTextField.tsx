import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { FormikErrors, FormikTouched } from 'formik';

type FormikTextFieldProps<T extends object> = TextFieldProps & {
  name: keyof T & string;
  touched?: FormikTouched<T>;
  errors?: FormikErrors<T>;
};

function FormikTextField<T extends object>({
  name,
  touched,
  errors,
  ...props
}: FormikTextFieldProps<T>) {
  const isTouched = touched?.[name];
  const errorMsg = errors?.[name];
  return (
    <TextField
      name={name}
      error={Boolean(isTouched && errorMsg)}
      helperText={isTouched && typeof errorMsg === 'string' ? errorMsg : undefined}
      {...props}
    />
  );
}

export default FormikTextField;
