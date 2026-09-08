"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  HelpCircle, MessageCircle, BookOpen, Mail, ExternalLink
} from "lucide-react";
import Link from "next/link";

const helpTopics = [
  {
    title: "Getting Started",
    description: "Learn the basics of BIZORA",
    icon: BookOpen,
    items: [
      "Setting up your business profile",
      "Adding your first products",
      "Creating invoices and bills",
      "Managing customers and khata",
    ],
  },
  {
    title: "Quick Actions",
    description: "Common tasks and shortcuts",
    icon: HelpCircle,
    items: [
      "Press Ctrl+K to open global search",
      "Use keyboard shortcuts for billing",
      "Export data as CSV anytime",
      "Share invoices via WhatsApp",
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Help & Support</h1>
        <p className="text-muted-foreground">Get help with using BIZORA</p>
      </div>

      {helpTopics.map((topic) => (
        <Card key={topic.title}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <topic.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{topic.title}</h3>
                <p className="text-sm text-muted-foreground">{topic.description}</p>
              </div>
            </div>
            <ul className="space-y-2">
              {topic.items.map((item) => (
                <li key={item} className="text-sm text-muted-foreground flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-muted-foreground shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardContent className="p-6 text-center">
          <Mail className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold mb-1">Need more help?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Contact our support team and we&apos;ll get back to you.
          </p>
          <a
            href="mailto:support@bizora.app"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <MessageCircle className="h-4 w-4" />
            support@bizora.app
            <ExternalLink className="h-3 w-3" />
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
