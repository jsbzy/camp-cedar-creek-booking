import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

// Black/white palette per site conventions — photography carries the color,
// emails stay monochrome.
export const styles = {
  body: {
    backgroundColor: "#f5f5f4",
    fontFamily:
      "'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    color: "#171717",
    margin: 0,
    padding: "24px 0",
  },
  container: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    margin: "0 auto",
    maxWidth: "560px",
    padding: "32px",
  },
  brand: {
    fontFamily: "'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    fontSize: "14px",
    fontWeight: 700 as const,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "#171717",
    margin: "0 0 24px",
  },
  h1: {
    fontFamily: "'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    fontSize: "22px",
    fontWeight: 600 as const,
    margin: "0 0 12px",
  },
  text: {
    fontSize: "14px",
    lineHeight: "22px",
    margin: "0 0 12px",
  },
  muted: {
    fontSize: "13px",
    lineHeight: "20px",
    color: "#737373",
    margin: "0 0 8px",
  },
  hr: { borderColor: "#e5e5e5", margin: "20px 0" },
  button: {
    backgroundColor: "#171717",
    borderRadius: "8px",
    color: "#ffffff",
    display: "inline-block",
    fontSize: "14px",
    fontWeight: 600 as const,
    padding: "12px 24px",
    textDecoration: "none",
  },
  footer: {
    fontSize: "12px",
    color: "#a3a3a3",
    lineHeight: "18px",
    margin: "24px 0 0",
    textAlign: "center" as const,
  },
};

export function EmailLayout({
  preview,
  heading,
  children,
}: {
  preview: string;
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.brand}>Camp Cedar Creek</Text>
          <Heading style={styles.h1}>{heading}</Heading>
          {children}
        </Container>
        <Text style={styles.footer}>
          Camp Cedar Creek · Sandy, Oregon
          <br />
          Questions? Just reply to this email.
        </Text>
      </Body>
    </Html>
  );
}

export function DetailRow({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <table width="100%" cellPadding={0} cellSpacing={0} style={{ margin: "0 0 6px" }}>
      <tbody>
        <tr>
          <td style={{ fontSize: "13px", color: "#737373" }}>{label}</td>
          <td style={{ fontSize: "13px", textAlign: "right", fontWeight: 500 }}>{value}</td>
        </tr>
      </tbody>
    </table>
  );
}

export function DetailsCard({ children }: { children: React.ReactNode }) {
  return (
    <Section
      style={{
        backgroundColor: "#fafaf9",
        border: "1px solid #e5e5e5",
        borderRadius: "8px",
        padding: "16px 20px",
        margin: "8px 0 16px",
      }}
    >
      {children}
    </Section>
  );
}

export function CtaButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Section style={{ textAlign: "center", margin: "20px 0 8px" }}>
      <Link href={href} style={styles.button}>
        {children}
      </Link>
    </Section>
  );
}

export { Hr, Text, Section, Link };

// Format "2026-07-24" → "Friday, July 24, 2026" without timezone surprises.
export function formatDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatMoney(n: number): string {
  return `$${n.toFixed(2)}`;
}
