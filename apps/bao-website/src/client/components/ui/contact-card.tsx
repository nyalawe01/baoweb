import React from 'react';
import { cn } from '@/lib/utils';
import { type LucideIcon, Plus } from 'lucide-react';

export type ContactInfoProps = React.ComponentProps<'div'> & {
  icon: LucideIcon;
  label: string;
  value: string;
};

export type ContactCardProps = React.ComponentProps<'div'> & {
  title?: string;
  description?: string;
  contactInfo?: ContactInfoProps[];
  formSectionClassName?: string;
};

export function ContactCard({
  title = 'Contact Babawatoto Organization',
  description = 'Reach out to our leadership, social welfare, and child protection teams in Dar es Salaam. We are dedicated to safeguarding vulnerable children and empowering Tanzanian youth.',
  contactInfo,
  className,
  formSectionClassName,
  children,
  ...props
}: ContactCardProps) {
  return (
    <div
      className={cn(
        'bg-white border-2 border-black/15 relative grid h-full w-full shadow-lg md:grid-cols-2 lg:grid-cols-3 rounded-2xl overflow-visible',
        className
      )}
      {...props}
    >
      {/* Corner crosshairs in BAO gold brand color */}
      <Plus className="absolute -top-3 -left-3 h-6 w-6 text-[#E6A500] z-20 stroke-[3]" />
      <Plus className="absolute -top-3 -right-3 h-6 w-6 text-[#E6A500] z-20 stroke-[3]" />
      <Plus className="absolute -bottom-3 -left-3 h-6 w-6 text-[#E6A500] z-20 stroke-[3]" />
      <Plus className="absolute -right-3 -bottom-3 h-6 w-6 text-[#E6A500] z-20 stroke-[3]" />

      <div className="flex flex-col justify-between lg:col-span-2">
        <div className="relative h-full space-y-6 px-6 py-8 md:p-10">
          <div className="space-y-3">
            <span className="inline-block px-3 py-1 bg-[#E6A500] text-black font-extrabold uppercase text-xs tracking-wider rounded-xs">
              Direct Community & Partner Support
            </span>
            <h1 className="text-3xl font-black text-black md:text-4xl lg:text-5xl tracking-tight">
              {title}
            </h1>
            <p className="text-black/80 max-w-xl text-sm md:text-base leading-relaxed font-medium">
              {description}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-4 border-t border-black/10">
            {contactInfo?.map((info, index) => (
              <ContactInfo key={index} {...info} />
            ))}
          </div>
        </div>
      </div>

      <div
        className={cn(
          'bg-[#FAFAFA] flex h-full w-full items-center border-t border-black/10 p-6 md:p-8 md:col-span-1 md:border-t-0 md:border-l rounded-b-2xl md:rounded-r-2xl md:rounded-bl-none',
          formSectionClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function ContactInfo({
  icon: Icon,
  label,
  value,
  className,
  ...props
}: ContactInfoProps) {
  return (
    <div className={cn('flex items-start gap-3 py-2', className)} {...props}>
      <div className="bg-[#E6A500]/15 border border-[#E6A500]/40 rounded-xl p-2.5 shrink-0 text-black">
        <Icon className="h-5 w-5 text-black" />
      </div>
      <div className="min-w-0">
        <p className="font-extrabold text-xs uppercase tracking-wider text-black">{label}</p>
        <p className="text-black/85 text-xs sm:text-sm font-medium break-words mt-0.5">{value}</p>
      </div>
    </div>
  );
}

