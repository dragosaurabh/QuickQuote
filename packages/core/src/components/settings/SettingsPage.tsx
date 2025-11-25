'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { FileUpload } from '../ui/FileUpload';
import { Card } from '../ui/Card';
import { LoadingSpinner } from '../feedback/LoadingSpinner';
import { ServiceList, ServiceListProps } from '../services/ServiceList';
import { Business } from '../../types/models';
import { BusinessFormInput, businessFormSchema } from '../../types/schemas';
import { ZodError } from 'zod';

type SettingsTab = 'business' | 'services' | 'defaults';

interface TabConfig {
  id: SettingsTab;
  label: string;
  icon: string;
}

const TABS: TabConfig[] = [
  { id: 'business', label: 'Business Profile', icon: '🏢' },
  { id: 'services', label: 'Services', icon: '📋' },
  { id: 'defaults', label: 'Quote Defaults', icon: '⚙️' },
];

export interface SettingsPageProps {
  business: Business;
  onUpdateBusiness: (data: BusinessFormInput) => Promise<Business | null>;
  onUploadLogo: (file: File) => Promise<string | null>;
  businessLoading?: boolean;
  businessError?: Error | null;
  serviceListProps: Omit<ServiceListProps, 'onRefetch'> & {
    onRefetch: () => Promise<void>;
  };
}

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  defaultTerms?: string;
  defaultValidityDays?: string;
}

/**
 * Settings page with tabbed interface for business profile, services, and defaults
 * Validates: Requirements 2.5, 3.1, 3.2, 3.3
 */
export const SettingsPage: React.FC<SettingsPageProps> = ({
  business,
  onUpdateBusiness,
  onUploadLogo,
  businessLoading = false,
  businessError,
  serviceListProps,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('business');

  const [formData, setFormData] = useState<BusinessFormInput>({
    name: business.name,
    phone: business.phone || '',
    email: business.email || '',
    address: business.address || '',
    defaultTerms: business.defaultTerms || '',
    defaultValidityDays: business.defaultValidityDays,
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(business.logoUrl || null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const updateField = useCallback((field: keyof BusinessFormInput, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const validateBusinessForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Business name is required';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.defaultValidityDays < 1 || formData.defaultValidityDays > 365) {
      newErrors.defaultValidityDays = 'Validity must be between 1 and 365 days';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleLogoSelect = useCallback((file: File) => {
    setLogoFile(file);
    setSaveSuccess(false);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSaveBusinessProfile = useCallback(async () => {
    if (!validateBusinessForm()) return;

    setIsSaving(true);
    try {
      const validated = businessFormSchema.parse(formData);
      
      // Upload logo if changed
      if (logoFile) {
        await onUploadLogo(logoFile);
        setLogoFile(null);
      }
      
      const result = await onUpdateBusiness(validated);
      if (result) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      if (err instanceof ZodError) {
        const zodErrors: FormErrors = {};
        err.errors.forEach(e => {
          const field = e.path[0] as keyof FormErrors;
          zodErrors[field] = e.message;
        });
        setErrors(zodErrors);
      }
    } finally {
      setIsSaving(false);
    }
  }, [formData, logoFile, onUpdateBusiness, onUploadLogo, validateBusinessForm]);

  const handleSaveDefaults = useCallback(async () => {
    if (!validateBusinessForm()) return;

    setIsSaving(true);
    try {
      const validated = businessFormSchema.parse(formData);
      const result = await onUpdateBusiness(validated);
      if (result) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      if (err instanceof ZodError) {
        const zodErrors: FormErrors = {};
        err.errors.forEach(e => {
          const field = e.path[0] as keyof FormErrors;
          zodErrors[field] = e.message;
        });
        setErrors(zodErrors);
      }
    } finally {
      setIsSaving(false);
    }
  }, [formData, onUpdateBusiness, validateBusinessForm]);

  const renderTabButton = (tab: TabConfig) => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      className={`
        flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all
        ${activeTab === tab.id
          ? 'bg-primary text-white shadow-lg shadow-primary/30'
          : 'text-text-muted hover:text-text-primary hover:bg-surface'
        }
      `}
    >
      <span>{tab.icon}</span>
      <span className="hidden sm:inline">{tab.label}</span>
    </button>
  );


  const renderBusinessProfileTab = () => (
    <Card variant="elevated" padding="lg">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-1">Business Profile</h3>
          <p className="text-text-muted text-sm">
            Update your business information that appears on quotes
          </p>
        </div>

        {businessError && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
            {businessError.message}
          </div>
        )}

        {saveSuccess && (
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
            ✓ Changes saved successfully!
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
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
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Email Address"
            placeholder="Enter your email"
            type="email"
            value={formData.email || ''}
            onChange={e => updateField('email', e.target.value)}
            error={errors.email}
          />
          <div className="sm:col-span-2">
            <TextArea
              label="Business Address"
              placeholder="Enter your business address"
              value={formData.address || ''}
              onChange={e => updateField('address', e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <div>
          <FileUpload
            label="Business Logo"
            accept="image/png,image/jpeg,image/jpg"
            maxSize={2 * 1024 * 1024}
            onFileSelect={handleLogoSelect}
            preview={logoPreview}
            hint="PNG or JPG, max 2MB"
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-primary/10">
          <Button
            onClick={handleSaveBusinessProfile}
            isLoading={isSaving || businessLoading}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </Card>
  );

  const renderServicesTab = () => (
    <Card variant="elevated" padding="lg">
      <ServiceList
        {...serviceListProps}
        onRefetch={serviceListProps.onRefetch}
      />
    </Card>
  );

  const renderDefaultsTab = () => (
    <Card variant="elevated" padding="lg">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-1">Default Quote Settings</h3>
          <p className="text-text-muted text-sm">
            Configure default values for new quotes
          </p>
        </div>

        {saveSuccess && (
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
            ✓ Changes saved successfully!
          </div>
        )}

        <TextArea
          label="Default Terms & Conditions"
          placeholder="Enter your standard terms and conditions..."
          value={formData.defaultTerms || ''}
          onChange={e => updateField('defaultTerms', e.target.value)}
          rows={6}
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
          hint="How long quotes are valid by default (1-365 days)"
        />

        <div className="flex justify-end pt-4 border-t border-primary/10">
          <Button
            onClick={handleSaveDefaults}
            isLoading={isSaving || businessLoading}
          >
            Save Defaults
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-muted">Manage your business profile and preferences</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 bg-surface rounded-xl border border-primary/20">
        {TABS.map(renderTabButton)}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'business' && renderBusinessProfileTab()}
        {activeTab === 'services' && renderServicesTab()}
        {activeTab === 'defaults' && renderDefaultsTab()}
      </div>
    </div>
  );
};
