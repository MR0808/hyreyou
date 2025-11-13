import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text
} from '@react-email/components';

interface VerificationEmailProps {
    magicLink: string;
    otp: string;
}

export const VerificationEmail = ({
    magicLink,
    otp
}: VerificationEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Verify your HyreYou email address</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={logoSection}>
                        <Img
                            src="/images/assets/logo.png"
                            width="200"
                            height="auto"
                            alt="HyreYou"
                            style={logo}
                        />
                    </Section>

                    <Heading style={heading}>Verify your email address</Heading>

                    <Text style={text}>
                        Welcome to HyreYou! To complete your registration and
                        start building your verified professional profile,
                        please verify your email address.
                    </Text>

                    <Section style={buttonSection}>
                        <Button style={button} href={magicLink}>
                            Verify Email Address
                        </Button>
                    </Section>

                    <Text style={text}>
                        This link will expire in <strong>10 minutes</strong> for
                        security purposes.
                    </Text>

                    <Hr style={hr} />

                    <Section style={otpSection}>
                        <Text style={otpLabel}>
                            Or enter this verification code:
                        </Text>
                        <Text style={otpCode}>{otp}</Text>
                        <Text style={otpHelper}>
                            If the button above doesn&apos;t work, use this
                            6-digit code instead.
                        </Text>
                    </Section>

                    <Hr style={hr} />

                    <Text style={footer}>
                        If you didn&apos;t create a HyreYou account, you can
                        safely ignore this email.
                    </Text>

                    <Text style={footer}>
                        Need help? Contact us at{' '}
                        <Link href="mailto:support@hyreyou.com" style={link}>
                            support@hyreyou.com
                        </Link>
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

VerificationEmail.PreviewProps = {
    magicLink: 'fdssfsdfsdf',
    otp: '123456'
} as VerificationEmailProps;

export default VerificationEmail;

const main = {
    backgroundColor: '#f6f9fc',
    fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif'
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '40px 20px',
    marginBottom: '64px',
    borderRadius: '12px',
    maxWidth: '600px'
};

const logoSection = {
    textAlign: 'center' as const,
    marginBottom: '32px'
};

const logo = {
    margin: '0 auto'
};

const heading = {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: '24px',
    textAlign: 'center' as const
};

const text = {
    fontSize: '16px',
    lineHeight: '24px',
    color: '#475569',
    marginBottom: '16px'
};

const buttonSection = {
    textAlign: 'center' as const,
    marginTop: '32px',
    marginBottom: '32px'
};

const button = {
    backgroundColor: '#0891b2',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '14px 32px'
};

const hr = {
    borderColor: '#e2e8f0',
    margin: '32px 0'
};

const otpSection = {
    textAlign: 'center' as const,
    padding: '24px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px'
};

const otpLabel = {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '12px'
};

const otpCode = {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#0891b2',
    letterSpacing: '8px',
    fontFamily: 'monospace',
    margin: '16px 0'
};

const otpHelper = {
    fontSize: '14px',
    color: '#64748b',
    marginTop: '12px'
};

const footer = {
    fontSize: '14px',
    lineHeight: '20px',
    color: '#64748b',
    marginTop: '16px',
    textAlign: 'center' as const
};

const link = {
    color: '#0891b2',
    textDecoration: 'underline'
};
