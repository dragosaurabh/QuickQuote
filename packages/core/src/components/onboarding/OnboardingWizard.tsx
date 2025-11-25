'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { FileUpload } from '../ui/FileUpload';
import { Card } from '../ui/Card';
import { LoadingSpinner } from '../feedback/LoadingSpinner';
import { BusinessFormInput, businessFormSchema } from '../../types/schemas';
import { ZodError } from 'zod';

export interface OnboardingWizardProps {
  onComplete: (data: BusinessFormInput, logoFile?: File) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  defaultTerms?: string;
  defaultValidityDays?: string;
}

const STEPS = [
  { id: 1, title: 'Business Details', icon: '🏢' },
  { id: 2, title: 'Logo Upload', icon: '🖼️' },
  { id: 3, title: 'Default Settings', icon: '⚙️' },
];

/**
 * Multi-step onboarding wizard for business profile setup
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4
 */
export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  onComplete,
  isLoading = false,
  error,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BusinessFormInput>({
    name: '',
    phone: '',
    email: '',
    address: '',
    defaultTerms: '',
    defaultValidityDays: 7,
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const updateField = useCallback((field: keyof BusinessFormInput, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const validateStep1 = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Business name is required';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const validateStep3 = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    
    if (formData.defaultValidityDays < 1 || formData.defaultValidityDays > 365) {
      newErrors.defaultValidityDays = 'Validity must be between 1 and 365 days';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleNext = useCallback(() => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 3 && !validateStep3()) return;
    
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, validateStep1, validateStep3]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleLogoSelect = useCallback((file: File) => {
    setLogoFile(file);
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!validateStep3()) return;

    try {
      // Final validation with Zod
      const validated = businessFormSchema.parse(formData);
      await onComplete(validated, logoFile || undefined);
    } catch (err) {
      if (err instanceof ZodError) {
        const zodErrors: FormErrors = {};
        err.errors.forEach(e => {
          const field = e.path[0] as keyof FormErrors;
          zodErrors[field] = e.message;
        });
        setErrors(zodErrors);
      }
    }
  }, [formData, logoFile, onComplete, validateStep3]);

  const renderProgressIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {STEPS.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center">
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center text-lg
                transition-all duration-300
                ${currentStep >= step.id
                  ? 'bg-primary text-white'
                  : 'bg-surface border-2 border-primary/30 text-text-muted'
                }
              `}
            >
              {step.icon}
            </div>
            <span className={`
              text-xs mt-1 hidden sm:block
              ${currentStep >= step.id ? 'text-primary' : 'text-text-muted'}
            `}>
              {step.title}
            </span>
          </div>
          {index < STEPS.length - 1 && (
            <div
              className={`
                w-12 sm:w-20 h-1 mx-2
                ${currentStep > step.id ? 'bg-primary' : 'bg-primary/20'}
              `}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-text-primary mb-4">
        Tell us about your business 🏢
      </h2>
      <Input
        label="Business Name *"
        placeholder="Enter your business name"
        value={formData.name}
        onChange={e => updateField('name', e.target.value)}
        error={errors.name}
      />
      <Input
        label="Phone Number"
        placeholder="Enter your phone number"
        type="tel"
        value={formData.phone || ''}
        onChange={e => updateField('phone', e.target.value)}
        error={errors.phone}
      />
      <Input
        label="Email Address"
        placeholder="Enter your email"
        type="email"
        value={formData.email || ''}
        onChange={e => updateField('email', e.target.value)}
        error={errors.email}
      />
      <TextArea
        label="Business Address"
        placeholder="Enter your business address"
        value={formData.address || ''}
        onChange={e => updateField('address', e.target.value)}
        rows={3}
      />
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-text-primary mb-4">
        Add your logo 🖼️
      </h2>
      <p className="text-text-muted text-sm mb-4">
        Your logo will appear on all your quotes. You can skip this step and add it later.
      </p>
      <FileUpload
        label="Business Logo"
        accept="image/png,image/jpeg,image/jpg"
        maxSize={2 * 1024 * 1024}
        onFileSelect={handleLogoSelect}
        preview={logoPreview}
        hint="PNG or JPG, max 2MB"
      />
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-text-primary mb-4">
        Default Quote Settings ⚙️
      </h2>
      <p className="text-text-muted text-sm mb-4">
        Set your default terms and validity period for quotes. You can change these for individual quotes later.
      </p>
      <TextArea
        label="Default Terms & Conditions"
        placeholder="Enter your standard terms and conditions..."
        value={formData.defaultTerms || ''}
        onChange={e => updateField('defaultTerms', e.target.value)}
        rows={4}
        hint="These will be pre-filled on new quotes"
      />
      <Input
        label="Default Quote Validity (days)"
        type="number"
        min={1}
        max={365}
        value={formData.defaultValidityDays}
        onChange={e => updateField('defaultValidityDays', parseInt(e.target.value) || 7)}
        error={errors.defaultValidityDays}
        hint="How long quotes are valid by default"
      />
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" customMessage="Setting up your business... 🎃" />
      </div>
    );
  }

  return (
    <Card variant="elevated" padding="lg" className="max-w-xl mx-auto">
      {renderProgressIndicator()}
      
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}

      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}

      <div className="flex justify-between mt-8 pt-4 border-t border-primary/10">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          ← Back
        </Button>
        
        {currentStep < 3 ? (
          <Button onClick={handleNext}>
            Next →
          </Button>
        ) : (
          <Button onClick={handleSubmit} isLoading={isLoading}>
            Complete Setup 🎉
          </Button>
        )}
      </div>
    </Card>
  );
};
