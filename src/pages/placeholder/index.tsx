import { Card, Typography } from 'antd';

interface PlaceholderPageProps { title: string; description: string }
export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return <Card><Typography.Title level={2}>{title}</Typography.Title><Typography.Paragraph type="secondary">{description}</Typography.Paragraph></Card>;
}
