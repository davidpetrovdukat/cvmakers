'use client';

import { Button, Card, Input } from '@/components';
import Select from '@/components/ui/Select';
import Section from '@/components/layout/Section';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { REGISTRATION_COUNTRIES } from '@/lib/constants';
import { useLocale } from '@/i18n/LocaleProvider';
import { localizePath } from '@/i18n/config';

const COPY = {
  en: {
    createAccount: 'Create Account',
    login: 'Log in',
    signupIntro: 'Create your account to get started.',
    loginIntro: 'Welcome back! Please sign in.',
    fillRequired: 'Please fill in all required fields',
    registrationFailed: 'Registration failed',
    invalidLogin: 'Invalid email or password',
    email: 'Email',
    password: 'Password',
    firstName: 'First Name',
    lastName: 'Last Name',
    dateOfBirth: 'Date of Birth',
    street: 'Street Address',
    streetPlaceholder: 'Street name and number',
    city: 'City',
    cityPlaceholder: 'City name',
    country: 'Country',
    selectCountry: 'Select country',
    postalCode: 'Postal Code',
    postalPlaceholder: 'e.g., SW1A 1AA',
    termsPrefix: 'I have read and agree to the',
    terms: 'Terms and Conditions',
    creating: 'Creating...',
    signingIn: 'Signing in...',
    create: 'Create account',
  },
  tr: {
    createAccount: 'Hesap Oluştur',
    login: 'Giriş yap',
    signupIntro: 'Başlamak için hesabınızı oluşturun.',
    loginIntro: 'Tekrar hoş geldiniz. Lütfen giriş yapın.',
    fillRequired: 'Lütfen tüm zorunlu alanları doldurun',
    registrationFailed: 'Kayıt başarısız oldu',
    invalidLogin: 'E-posta veya şifre geçersiz',
    email: 'E-posta',
    password: 'Şifre',
    firstName: 'Ad',
    lastName: 'Soyad',
    dateOfBirth: 'Doğum Tarihi',
    street: 'Adres',
    streetPlaceholder: 'Sokak adı ve numara',
    city: 'Şehir',
    cityPlaceholder: 'Şehir adı',
    country: 'Ülke',
    selectCountry: 'Ülke seçin',
    postalCode: 'Posta Kodu',
    postalPlaceholder: 'örn. SW1A 1AA',
    termsPrefix: 'Okudum ve kabul ediyorum:',
    terms: 'Şartlar ve Koşullar',
    creating: 'Oluşturuluyor...',
    signingIn: 'Giriş yapılıyor...',
    create: 'Hesap oluştur',
  },
} as const;

export default function SignInClient() {
  const search = useSearchParams();
  const router = useRouter();
  const locale = useLocale();
  const copy = COPY[locale];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const callbackUrl = search.get('callbackUrl') || localizePath('/dashboard', locale);
  const mode = search.get('mode') || 'login';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === 'signup') {
      if (!firstName || !lastName || !dateOfBirth || !street || !city || !country || !postalCode) {
        setError(copy.fillRequired);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            firstName,
            lastName,
            dateOfBirth,
            street,
            city,
            country,
            postalCode,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || copy.registrationFailed);
        }

        await signIn('credentials', { email, password, redirect: true, callbackUrl });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setLoading(false);

    if (res?.ok) {
      router.push(callbackUrl);
    } else {
      setError(copy.invalidLogin);
    }
  };

  return (
    <main className="bg-[#F8FAFC]">
      <Section className="pt-6 pb-0 max-w-md">
        <Card className="p-6">
          <h1 className="text-xl font-semibold">{mode === 'signup' ? copy.createAccount : copy.login}</h1>
          <p className="text-sm text-slate-600 mt-1">
            {mode === 'signup' ? copy.signupIntro : copy.loginIntro}
          </p>

          {error && <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 text-sm p-3">{error}</div>}

          <form className="mt-4 grid gap-3" onSubmit={onSubmit}>
            <Input label={copy.email} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label={copy.password} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

            {mode === 'signup' && (
              <>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Input label={copy.firstName} type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                  <Input label={copy.lastName} type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                </div>
                <Input label={copy.dateOfBirth} type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required max={new Date().toISOString().split('T')[0]} />
                <Input label={copy.street} type="text" value={street} onChange={(e) => setStreet(e.target.value)} required placeholder={copy.streetPlaceholder} />
                <Input label={copy.city} type="text" value={city} onChange={(e) => setCity(e.target.value)} required placeholder={copy.cityPlaceholder} />
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <label className="text-xs text-[#475569] font-medium">{copy.country}</label>
                    <Select value={country} onChange={(e) => setCountry(e.target.value)} required>
                      <option value="">{copy.selectCountry}</option>
                      {REGISTRATION_COUNTRIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </Select>
                  </div>
                  <Input label={copy.postalCode} type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required placeholder={copy.postalPlaceholder} />
                </div>
              </>
            )}

            {mode === 'signup' && (
              <label className="flex items-start gap-2 text-sm text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>
                  {copy.termsPrefix}{' '}
                  <a href={localizePath('/terms', locale)} target="_blank" className="text-indigo-600 underline hover:text-indigo-800">
                    {copy.terms}
                  </a>
                </span>
              </label>
            )}

            <div className="mt-2">
              <Button type="submit" disabled={loading || (mode === 'signup' && !agreeTerms)} variant="primary">
                {loading ? (mode === 'signup' ? copy.creating : copy.signingIn) : (mode === 'signup' ? copy.create : copy.login)}
              </Button>
            </div>
          </form>
        </Card>
      </Section>
    </main>
  );
}
