'use client'
import { useLocale } from 'next-intl'
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { CheckCircle2, Loader2, Send } from 'lucide-react'
import { getClientSideURL } from '@/utilities/getURL'
import { Link } from '@/i18n/navigation'

interface InquiryFormData {
  'company-name': string
  'contact-name': string
  email: string
  phone: string
  'business-type': string
  'product-category': string
  'monthly-volume': string
  'delivery-city': string
  requirements?: string
}

interface B2BInquiryFormProps {
  formID: number | string
  initialCategory?: string
  initialRequirements?: string
  labels: {
    fields: {
      companyName: string
      contactName: string
      email: string
      phone: string
      businessType: string
      productCategory: string
      monthlyVolume: string
      deliveryCity: string
      requirements: string
    }
    businessTypeOptions: Array<{ value: string; label: string }>
    productCategoryOptions: Array<{ value: string; label: string }>
    monthlyVolumeOptions: Array<{ value: string; label: string }>
    placeholders: {
      select: string
    }
    submit: string
    submitting: string
    success: {
      backToProducts: string
      title: string
      message: string
    }
    error: string
    privacy: string
    validation: {
      required: string
      email: string
    }
  }
}

export function B2BInquiryForm({
  formID,
  labels,
  initialCategory,
  initialRequirements,
}: B2BInquiryFormProps) {
  const contentLocale = useLocale()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setFocus,
  } = useForm<InquiryFormData>({
    // Controlled selects register later than native inputs. Focus errors in
    // visual order instead of React Hook Form's registration order.
    shouldFocusError: false,
    defaultValues: {
      'company-name': '',
      'contact-name': '',
      email: '',
      phone: '',
      'business-type': '',
      'product-category':
        initialCategory &&
        labels.productCategoryOptions.some((option) => option.value === initialCategory)
          ? initialCategory
          : '',
      'monthly-volume': '',
      'delivery-city': '',
      requirements: initialRequirements || '',
    },
  })

  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (data: InquiryFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const submissionData = Object.entries(data).map(([field, value]) => ({
        field,
        value: String(value || ''),
      }))

      const req = await fetch(`${getClientSideURL()}/api/form-submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          form: formID,
          contentLocale,
          submissionData,
        }),
      })

      const res = await req.json()

      if (!req.ok) {
        setError(res.errors?.[0]?.message || labels.error)
        return
      }

      setHasSubmitted(true)
      window.dispatchEvent(
        new CustomEvent('insights:inquiry-submitted', { detail: { formId: String(formID) } }),
      )
      reset()
    } catch (err) {
      console.warn(err)
      setError(labels.error)
    } finally {
      setIsLoading(false)
    }
  }

  if (hasSubmitted) {
    return (
      <div
        aria-live="polite"
        className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center sm:p-12"
        role="status"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="mt-6 text-2xl font-bold text-emerald-900">{labels.success.title}</h3>
        <p className="mt-3 text-emerald-800">{labels.success.message}</p>
        <Link href="/products" className="pet-button mt-6">
          {labels.success.backToProducts}
        </Link>
      </div>
    )
  }

  const inputClassName = (invalid: boolean) =>
    `h-12 rounded-xl bg-white px-4 transition focus-visible:ring-ring/20 ${
      invalid ? 'border-red-300' : 'border-input'
    }`

  return (
    <form
      data-insights-form={String(formID)}
      aria-busy={isLoading}
      className="space-y-6"
      noValidate
      onSubmit={handleSubmit(onSubmit, (invalid) => {
        const fieldOrder: Array<keyof InquiryFormData> = [
          'company-name',
          'contact-name',
          'email',
          'phone',
          'business-type',
          'product-category',
          'monthly-volume',
          'delivery-city',
          'requirements',
        ]
        const firstInvalid = fieldOrder.find((name) => invalid[name])
        if (firstInvalid) setFocus(firstInvalid)
      })}
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Field
          id="company-name"
          label={labels.fields.companyName}
          required
          error={errors['company-name']?.message}
        >
          <Input
            aria-describedby="company-name-error"
            aria-invalid={Boolean(errors['company-name'])}
            aria-required="true"
            autoComplete="organization"
            className={inputClassName(Boolean(errors['company-name']))}
            id="company-name"
            type="text"
            {...register('company-name', { required: labels.validation.required })}
          />
        </Field>

        <Field
          id="contact-name"
          label={labels.fields.contactName}
          required
          error={errors['contact-name']?.message}
        >
          <Input
            aria-describedby="contact-name-error"
            aria-invalid={Boolean(errors['contact-name'])}
            aria-required="true"
            autoComplete="name"
            className={inputClassName(Boolean(errors['contact-name']))}
            id="contact-name"
            type="text"
            {...register('contact-name', { required: labels.validation.required })}
          />
        </Field>

        <Field id="email" label={labels.fields.email} required error={errors.email?.message}>
          <Input
            aria-describedby="email-error"
            aria-invalid={Boolean(errors.email)}
            aria-required="true"
            autoComplete="email"
            className={inputClassName(Boolean(errors.email))}
            id="email"
            type="email"
            {...register('email', {
              required: labels.validation.required,
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: labels.validation.email,
              },
            })}
          />
        </Field>

        <Field id="phone" label={labels.fields.phone} error={errors.phone?.message}>
          <Input
            aria-describedby="phone-error"
            aria-invalid={Boolean(errors.phone)}
            aria-required="false"
            autoComplete="tel"
            className={inputClassName(Boolean(errors.phone))}
            id="phone"
            inputMode="tel"
            type="tel"
            {...register('phone')}
          />
        </Field>

        <Field
          id="business-type"
          label={labels.fields.businessType}
          required
          error={errors['business-type']?.message}
        >
          <Controller
            control={control}
            name="business-type"
            rules={{ required: labels.validation.required }}
            render={({ field }) => (
              <Select
                name={field.name}
                onValueChange={field.onChange}
                value={field.value}
                disabled={isLoading}
              >
                <SelectTrigger
                  ref={field.ref}
                  onBlur={field.onBlur}
                  aria-describedby="business-type-error"
                  aria-invalid={Boolean(errors['business-type'])}
                  aria-required="true"
                  id="business-type"
                  className={`h-12 w-full rounded-xl border bg-white px-4 ${
                    errors['business-type'] ? 'border-red-300' : 'border-input'
                  }`}
                >
                  <SelectValue placeholder={labels.placeholders.select} />
                </SelectTrigger>
                <SelectContent>
                  {labels.businessTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <Field
          id="product-category"
          label={labels.fields.productCategory}
          required
          error={errors['product-category']?.message}
        >
          <Controller
            control={control}
            name="product-category"
            rules={{ required: labels.validation.required }}
            render={({ field }) => (
              <Select
                name={field.name}
                onValueChange={field.onChange}
                value={field.value}
                disabled={isLoading}
              >
                <SelectTrigger
                  ref={field.ref}
                  onBlur={field.onBlur}
                  aria-describedby="product-category-error"
                  aria-invalid={Boolean(errors['product-category'])}
                  aria-required="true"
                  id="product-category"
                  className={`h-12 w-full rounded-xl border bg-white px-4 ${
                    errors['product-category'] ? 'border-red-300' : 'border-input'
                  }`}
                >
                  <SelectValue placeholder={labels.placeholders.select} />
                </SelectTrigger>
                <SelectContent>
                  {labels.productCategoryOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <Field
          id="monthly-volume"
          label={labels.fields.monthlyVolume}
          required
          error={errors['monthly-volume']?.message}
        >
          <Controller
            control={control}
            name="monthly-volume"
            rules={{ required: labels.validation.required }}
            render={({ field }) => (
              <Select
                name={field.name}
                onValueChange={field.onChange}
                value={field.value}
                disabled={isLoading}
              >
                <SelectTrigger
                  ref={field.ref}
                  onBlur={field.onBlur}
                  aria-describedby="monthly-volume-error"
                  aria-invalid={Boolean(errors['monthly-volume'])}
                  aria-required="true"
                  id="monthly-volume"
                  className={`h-12 w-full rounded-xl border bg-white px-4 ${
                    errors['monthly-volume'] ? 'border-red-300' : 'border-input'
                  }`}
                >
                  <SelectValue placeholder={labels.placeholders.select} />
                </SelectTrigger>
                <SelectContent>
                  {labels.monthlyVolumeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <Field
          id="delivery-city"
          label={labels.fields.deliveryCity}
          required
          error={errors['delivery-city']?.message}
        >
          <Input
            aria-describedby="delivery-city-error"
            aria-invalid={Boolean(errors['delivery-city'])}
            aria-required="true"
            autoComplete="address-level2"
            className={inputClassName(Boolean(errors['delivery-city']))}
            id="delivery-city"
            type="text"
            {...register('delivery-city', { required: labels.validation.required })}
          />
        </Field>
      </div>

      <Field id="requirements" label={labels.fields.requirements}>
        <Textarea
          aria-describedby="requirements-error"
          id="requirements"
          rows={5}
          className="rounded-xl border-input bg-white px-4 py-3"
          {...register('requirements')}
        />
      </Field>

      {error && (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="flex flex-col items-start gap-4 border-t border-input pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-md text-xs leading-5 text-muted-foreground sm:text-sm">
          {labels.privacy}
        </p>
        <Button
          type="submit"
          disabled={isLoading}
          className="h-12 w-full rounded-xl bg-primary px-8 font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-50 sm:w-auto"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {labels.submitting}
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              {labels.submit}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

function Field({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <Label htmlFor={id} className="mb-2 block text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </Label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-red-600" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
