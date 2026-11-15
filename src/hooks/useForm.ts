import { useCallback, useState } from "react";

import { z } from "zod";

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const schemas = {
  email: z.string().email("Please enter a valid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),

  passwordSimple: z.string().min(6, "Password must be at least 6 characters"),

  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),

  prompt: z
    .string()
    .min(3, "Prompt must be at least 3 characters")
    .max(1000, "Prompt must be less than 1000 characters"),

  url: z.string().url("Please enter a valid URL"),

  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number"),

  required: z.string().min(1, "This field is required"),

  optional: z.string().optional(),
};

// Common form schemas
export const loginSchema = z.object({
  email: schemas.email,
  password: schemas.passwordSimple,
});

export const signupSchema = z
  .object({
    name: schemas.name,
    email: schemas.email,
    password: schemas.password,
    confirmPassword: z.string(),
  })
  .refine(
    (data: { password: string; confirmPassword: string }) => data.password === data.confirmPassword,
    {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    }
  );

export const profileSchema = z.object({
  name: schemas.name,
  email: schemas.email,
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
});

export const promptSchema = z.object({
  prompt: schemas.prompt,
});

// ============================================================================
// TYPES
// ============================================================================

export type FormErrors<T> = Partial<Record<keyof T, string>>;

export interface UseFormOptions<T extends z.ZodObject<any>> {
  schema: T;
  initialValues?: Partial<z.infer<T>>;
  onSubmit?: (values: z.infer<T>) => void | Promise<void>;
}

export interface UseFormReturn<T extends z.ZodObject<any>> {
  values: Partial<z.infer<T>>;
  errors: FormErrors<z.infer<T>>;
  touched: Partial<Record<keyof z.infer<T>, boolean>>;
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
  setValue: <K extends keyof z.infer<T>>(field: K, value: z.infer<T>[K]) => void;
  setValues: (values: Partial<z.infer<T>>) => void;
  setError: <K extends keyof z.infer<T>>(field: K, error: string) => void;
  clearError: <K extends keyof z.infer<T>>(field: K) => void;
  clearErrors: () => void;
  setTouched: <K extends keyof z.infer<T>>(field: K) => void;
  validate: () => boolean;
  validateField: <K extends keyof z.infer<T>>(field: K) => boolean;
  handleSubmit: () => Promise<void>;
  reset: () => void;
  getFieldProps: <K extends keyof z.infer<T>>(
    field: K
  ) => {
    value: z.infer<T>[K] | undefined;
    onChangeText: (value: string) => void;
    onBlur: () => void;
    error: string | undefined;
  };
}

// ============================================================================
// HOOK
// ============================================================================

export function useForm<T extends z.ZodObject<any>>(options: UseFormOptions<T>): UseFormReturn<T> {
  const { schema, initialValues = {}, onSubmit } = options;

  type FormValues = z.infer<T>;

  const [values, setValuesState] = useState<Partial<FormValues>>(initialValues);
  const [errors, setErrors] = useState<FormErrors<FormValues>>({});
  const [touched, setTouchedState] = useState<Partial<Record<keyof FormValues, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const setValue = useCallback(<K extends keyof FormValues>(field: K, value: FormValues[K]) => {
    setValuesState((prev: Partial<FormValues>) => ({ ...prev, [field]: value }));
    setIsDirty(true);
    // Clear error on change
    setErrors((prev: FormErrors<FormValues>) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const setValues = useCallback((newValues: Partial<FormValues>) => {
    setValuesState((prev: Partial<FormValues>) => ({ ...prev, ...newValues }));
    setIsDirty(true);
  }, []);

  const setError = useCallback(<K extends keyof FormValues>(field: K, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const clearError = useCallback(<K extends keyof FormValues>(field: K) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setTouched = useCallback(<K extends keyof FormValues>(field: K) => {
    setTouchedState((prev) => ({ ...prev, [field]: true }));
  }, []);

  const validateField = useCallback(
    <K extends keyof FormValues>(field: K): boolean => {
      const fieldSchema = schema.shape[field as string];
      if (!fieldSchema) return true;

      const result = fieldSchema.safeParse(values[field]);
      if (!result.success) {
        const errorMessage = result.error.errors[0]?.message ?? "Invalid value";
        setError(field, errorMessage);
        return false;
      }

      clearError(field);
      return true;
    },
    [schema, values, setError, clearError]
  );

  const validate = useCallback((): boolean => {
    const result = schema.safeParse(values);

    if (!result.success) {
      const newErrors: FormErrors<FormValues> = {};
      result.error.errors.forEach((err: { path: (string | number)[]; message: string }) => {
        const field = err.path[0] as keyof FormValues;
        if (!newErrors[field]) {
          newErrors[field] = err.message;
        }
      });
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  }, [schema, values]);

  const isValid = Object.keys(errors).length === 0 && schema.safeParse(values).success;

  const handleSubmit = useCallback(async () => {
    // Mark all fields as touched
    const allTouched = Object.keys(schema.shape).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as Record<keyof FormValues, boolean>
    );
    setTouchedState(allTouched);

    if (!validate()) {
      return;
    }

    if (!onSubmit) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values as FormValues);
    } finally {
      setIsSubmitting(false);
    }
  }, [validate, onSubmit, values, schema]);

  const reset = useCallback(() => {
    setValuesState(initialValues);
    setErrors({});
    setTouchedState({});
    setIsDirty(false);
    setIsSubmitting(false);
  }, [initialValues]);

  const getFieldProps = useCallback(
    <K extends keyof FormValues>(field: K) => ({
      value: values[field],
      onChangeText: (value: string) => setValue(field, value as FormValues[K]),
      onBlur: () => {
        setTouched(field);
        validateField(field);
      },
      error: touched[field] ? errors[field] : undefined,
    }),
    [values, errors, touched, setValue, setTouched, validateField]
  );

  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    isDirty,
    setValue,
    setValues,
    setError,
    clearError,
    clearErrors,
    setTouched,
    validate,
    validateField,
    handleSubmit,
    reset,
    getFieldProps,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Validate a single value against a schema
 */
export function validateValue<T>(schema: z.ZodType<T>, value: unknown): string | null {
  const result = schema.safeParse(value);
  if (!result.success) {
    return result.error.errors[0]?.message ?? "Invalid value";
  }
  return null;
}

/**
 * Validate an email address
 */
export function validateEmail(email: string): string | null {
  return validateValue(schemas.email, email);
}

/**
 * Validate a password
 */
export function validatePassword(password: string, simple = false): string | null {
  return validateValue(simple ? schemas.passwordSimple : schemas.password, password);
}

/**
 * Check if passwords match
 */
export function validatePasswordMatch(password: string, confirmPassword: string): string | null {
  if (password !== confirmPassword) {
    return "Passwords don't match";
  }
  return null;
}
