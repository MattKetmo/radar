import { ListFooter } from '@/components/layout/list-footer';

type Props = {
  silenceCount: number;
  loading: boolean;
  refreshSilences: () => void;
}

export function Footer(props: Props) {
  const { silenceCount, loading, refreshSilences } = props

  return (
    <ListFooter
      count={silenceCount}
      loading={loading}
      onRefresh={refreshSilences}
      label="silences"
    />
  );
}
