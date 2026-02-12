/**
 * Personal Info Section Component
 * Editable personal information fields with phone verification
 */

import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { HapticPressable } from '@/components/ui';
import { CheckCircle2 } from 'lucide-react-native';

import { ButtonText } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { Section } from './Section';
import { EditableField } from './EditableField';
import { PhoneVerificationField } from './PhoneVerificationField';
import type { ThemeColors, EditingField, ProfileFormData, ProfileStatus } from './types';

interface PersonalInfoSectionProps {
  form: ProfileFormData;
  user: {
    email?: string;
  } | null;
  profile: ProfileStatus;
  editingField: EditingField;
  saving: boolean;
  colors: ThemeColors;
  onEdit: (field: EditingField) => void;
  onSave: (field: EditingField) => void;
  onCancel: () => void;
  onUpdateField: (field: keyof ProfileFormData, value: string) => void;
  onPhoneRemove?: () => Promise<void>;
  onPhoneVerified?: () => void;
}

export function PersonalInfoSection({
  form,
  user,
  profile,
  editingField,
  saving,
  colors,
  onEdit,
  onSave,
  onCancel,
  onUpdateField,
  onPhoneRemove,
  onPhoneVerified,
}: PersonalInfoSectionProps) {
  const handleEmailPress = () => {
    if (profile.emailVerified) {
      Alert.alert(
        'Cannot change verified email',
        'Please email support@revvup.ae to change your verified email address. This protects you from fraudulent activities.'
      );
    }
  };

  const handlePhoneSave = async () => {
    await onSave('phone');
  };

  return (
    <Section title="Personal Information" colors={colors} delay={200}>
      <EditableField
        label="First Name"
        value={form.firstName}
        placeholder="Enter first name"
        isEditing={editingField === 'firstName'}
        onEdit={() => onEdit('firstName')}
        onSave={() => onSave('firstName')}
        onCancel={onCancel}
        onChange={(text) => onUpdateField('firstName', text)}
        saving={saving}
        colors={colors}
      />
      <EditableField
        label="Last Name"
        value={form.lastName}
        placeholder="Enter last name"
        isEditing={editingField === 'lastName'}
        onEdit={() => onEdit('lastName')}
        onSave={() => onSave('lastName')}
        onCancel={onCancel}
        onChange={(text) => onUpdateField('lastName', text)}
        saving={saving}
        colors={colors}
      />
      <EditableField
        label="Email Address"
        value={user?.email || ''}
        placeholder=""
        disabled
        suffix={
          profile.emailVerified ? (
            <CheckCircle2 size={16} color={colors.success} strokeWidth={2} />
          ) : (
            <HapticPressable onPress={() => {}}>
              <ButtonText size="small" tone="primary">
                Verify
              </ButtonText>
            </HapticPressable>
          )
        }
        isEditing={false}
        onEdit={handleEmailPress}
        onSave={() => {}}
        onCancel={() => {}}
        onChange={() => {}}
        saving={false}
        colors={colors}
      />
      
      {/* Divider before phone field */}
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      
      {/* Phone Verification Field with OTP flow */}
      <PhoneVerificationField
        phone={form.phone}
        isVerified={profile.phoneNumberVerified}
        colors={colors}
        onPhoneChange={(text) => onUpdateField('phone', text)}
        onPhoneSave={handlePhoneSave}
        onPhoneRemove={onPhoneRemove || (async () => {})}
        onVerified={onPhoneVerified || (() => {})}
      />
    </Section>
  );
}

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: Spacing.lg,
  },
});
