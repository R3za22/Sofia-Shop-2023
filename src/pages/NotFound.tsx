import { ErrorState } from '../components/States';
import { ApiError } from '../api/types';

export function NotFound() {
  return <div className="wrap page"><ErrorState error={new ApiError('not_found')} /></div>;
}
