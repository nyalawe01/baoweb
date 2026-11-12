import { ContactCard } from "@/components/ui/contact-card";
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function DefaultDemo() {
  return (
    <main className="relative flex size-full min-h-screen w-full items-center justify-center p-4 bg-white">
      <div className="mx-auto max-w-5xl w-full">
        <ContactCard
          title="Contact Babawatoto Organization"
          description="If you have any questions regarding our programmes, child safeguarding, volunteer opportunities, or partnerships, please reach out. We do our best to respond within 1 business day."
          contactInfo={[
            {
              icon: Mail,
              label: 'Email',
              value: 'info@babawatoto.or.tz',
            },
            {
              icon: Phone,
              label: 'Phone',
              value: '+255 651 136502 / +255 651 136504',
            },
            {
              icon: MapPin,
              label: 'Address',
              value: 'St. Anne Marie Street, House No. 27, Morogoro Road, Mbezi Kwa Msuguri, Dar es Salaam, Tanzania',
              className: 'col-span-2',
            },
            {
              icon: Clock,
              label: 'Office Hours',
              value: 'Mon – Fri: 8:00 AM – 5:00 PM (EAT)',
            },
          ]}
        >
          <form action="" className="w-full space-y-4">
            <div className="flex flex-col gap-2">
              <Label>Name</Label>
              <Input type="text" placeholder="Your full name" />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Email</Label>
              <Input type="email" placeholder="name@example.com" />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Phone</Label>
              <Input type="tel" placeholder="+255..." />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Message</Label>
              <Textarea placeholder="Write your message here..." />
            </div>
            <Button className="w-full bg-[#E6A500] hover:bg-black text-black hover:text-white font-bold" type="button">
              Submit
            </Button>
          </form>
        </ContactCard>
      </div>
    </main>
  );
}

