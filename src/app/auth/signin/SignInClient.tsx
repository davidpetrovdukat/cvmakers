'use client';

import { Button, Card, Input } from '@/components';
import Select from '@/components/ui/Select';
import Section from '@/components/layout/Section';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { REGISTRATION_COUNTRIES } from '@/lib/constants';

export default function SignInClient() {
  const search = useSearchParams();
  const router = useRouter();
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

  const callbackUrl = search.get('callbackUrl') || '/dashboard';
  const mode = search.get('mode') || 'login';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // --- ЛОГИКА РЕГИСТРАЦИИ ---
    if (mode === 'signup') {
      // Валидация обязательных полей
      if (!firstName || !lastName || !dateOfBirth || !street || !city || !country || !postalCode) {
        setError('Please fill in all required fields');
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
            postalCode
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Registration failed');
        }

        // После успешной регистрации, автоматически входим в систему
        await signIn('credentials', { email, password, redirect: true, callbackUrl });

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    // --- ЛОГИКА ВХОДА ---
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
      setError('Invalid email or password');
    }
  };

  return (
    <main className="bg-[#F8FAFC]">
      <Section className="pt-6 pb-0 max-w-md">
        <Card className="p-6">
          <h1 className="text-xl font-semibold">{mode === 'signup' ? 'Create Account' : 'Log in'}</h1>
          <p className="text-sm text-slate-600 mt-1">
            {mode === 'signup' ? 'Create your account to get started.' : 'Welcome back! Please sign in.'}
          </p>

          {error && (
            <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 text-sm p-3">{error}</div>
          )}
          <form className="mt-4 grid gap-3" onSubmit={onSubmit}>
            <Input label="Email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
            <Input label="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
            
            {mode === 'signup' && (
              <>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Input 
                    label="First Name" 
                    type="text" 
                    value={firstName} 
                    onChange={(e)=>setFirstName(e.target.value)} 
                    required 
                  />
                  <Input 
                    label="Last Name" 
                    type="text" 
                    value={lastName} 
                    onChange={(e)=>setLastName(e.target.value)} 
                    required 
                  />
                </div>
                <Input 
                  label="Date of Birth" 
                  type="date" 
                  value={dateOfBirth} 
                  onChange={(e)=>setDateOfBirth(e.target.value)} 
                  required 
                  max={new Date().toISOString().split('T')[0]}
                />
                <Input 
                  label="Street Address" 
                  type="text" 
                  value={street} 
                  onChange={(e)=>setStreet(e.target.value)} 
                  required 
                  placeholder="Street name and number"
                />
                <Input 
                  label="City" 
                  type="text" 
                  value={city} 
                  onChange={(e)=>setCity(e.target.value)} 
                  required 
                  placeholder="City name"
                />
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <label className="text-xs text-[#475569] font-medium">Country</label>
                    <Select 
                      value={country} 
                      onChange={(e)=>setCountry(e.target.value)} 
                      required
                    >
                      <option value="">Select country</option>
                      {REGISTRATION_COUNTRIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </Select>
                  </div>
                  <Input 
                    label="Postal Code" 
                    type="text" 
                    value={postalCode} 
                    onChange={(e)=>setPostalCode(e.target.value)} 
                    required 
                    placeholder="e.g., SW1A 1AA"
                  />
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
                  I have read and agree to the{' '}
                  <a href="/terms" target="_blank" className="text-indigo-600 underline hover:text-indigo-800">
                    Terms and Conditions
                  </a>
                </span>
              </label>
            )}

            <div className="mt-2">
              <Button 
                type="submit" 
                disabled={loading || (mode === 'signup' && !agreeTerms)} 
                variant="primary"
              >
                {loading ? (mode === 'signup' ? 'Creating…' : 'Signing in…') : (mode === 'signup' ? 'Create account' : 'Log in')}
              </Button>
            </div>
          </form>
        </Card>
      </Section>
    </main>
  );
}
