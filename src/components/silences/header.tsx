import AppHeader from '@/components/layout/app-header';
import { RefreshControls } from '@/components/layout/refresh-controls';

type Props = {
  errors: Record<string, string>;
  loading: boolean;
  refreshSilences: () => void;
  refreshInterval: number;
  setRefreshInterval: (interval: number) => void;
}

export function Header(props: Props) {
  const { errors, loading, refreshSilences, refreshInterval, setRefreshInterval } = props;

  return (
    <AppHeader>
      <div className='flex items-center gap-2'>
        <div className="font-medium">
          Silences
        </div>
        <RefreshControls
          loading={loading}
          errors={errors}
          refreshInterval={refreshInterval}
          onRefresh={refreshSilences}
          onRefreshIntervalChange={setRefreshInterval}
        />
      </div>
    </AppHeader>
  );
}
