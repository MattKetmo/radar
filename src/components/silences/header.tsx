import { LoaderCircle, Plus, RefreshCcw, TriangleAlert } from 'lucide-react';
import AppHeader from '@/components/layout/app-header';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { Button } from '../ui/button';

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
        {/* <div className="inline-flex h-8 items-center justify-center rounded-md bg-accent p-1 text-accent-foreground">
          <Link
            href="/silences"
            data-state="active"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-0.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            All
          </Link>
          <Link
            href="/silences?state=expired"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-0.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            Expired
          </Link>
        </div>
        <div>
          <Button size="xs" className='pl-4 pr-2 py-0.5'>
            New silence
            <Plus className='' />
          </Button>
        </div> */}
        <div>
          {
            !loading && Object.entries(errors).length > 0 && (
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TriangleAlert
                      size={16}
                      className='text-orange-500'
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <ul>
                      {Object.entries(errors).map(([cluster, message]) => (
                        <li key={cluster}>
                          <span className='font-semibold'>{cluster}</span>: {message}
                        </li>
                      ))}
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )
          }
        </div>

        <div className='grow' />

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              disabled={loading}
              onClick={() => refreshSilences()}
              className={loading ? 'cursor-not-allowed text-muted-foreground ' : ''}
            >
              {loading && (
                <LoaderCircle size={16} className='animate-[spin_1s]' />
              ) || (
                  <RefreshCcw size={16} />
                )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="flex items-center gap-2">
            <span>Refresh</span>
            <span className="font-mono flex items-center justify-center h-5 w-5 text-muted-foreground border-muted-foreground border rounded-sm">R</span>
          </TooltipContent>
        </Tooltip>

        <div>
          <Select value={`${refreshInterval}`} onValueChange={(value) => setRefreshInterval(Number(value))}>
            <SelectTrigger className="w-[80px] h-[30px]">
              <SelectValue placeholder="Refresh" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Off</SelectItem>
              <SelectItem value="10">10s</SelectItem>
              <SelectItem value="30">30s</SelectItem>
              <SelectItem value="60">60s</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </AppHeader>
  );
}
