import { useState, useEffect, useCallback, useRef } from 'react';
import { Issue } from '../types';
import { issuesApi } from '../services/api';
import { calculateDistanceMeters } from '../utils/helpers';

export interface NearbyIssueItem extends Issue {
  distanceMeters: number;
}

const DEFAULT_FALLBACK_LAT = 31.3260;
const DEFAULT_FALLBACK_LNG = 75.5762;

export function useNearbyReports(
  userLat?: number,
  userLng?: number,
  radiusMeters?: number
) {
  const [issues, setIssues] = useState<NearbyIssueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cached raw issues to allow instant in-memory distance recalculation when GPS locks
  const rawIssuesRef = useRef<Issue[]>([]);

  const lat = userLat ?? DEFAULT_FALLBACK_LAT;
  const lng = userLng ?? DEFAULT_FALLBACK_LNG;

  const fetchNearby = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Query city-wide reports (50km radius) so all city map issues are accessible
      const rawIssues = await issuesApi.getNearby(lat, lng, 50000, undefined, undefined, true);
      rawIssuesRef.current = rawIssues;

      const itemsWithDistance: NearbyIssueItem[] = rawIssues.map((issue) => {
        const dist = calculateDistanceMeters(
          lat,
          lng,
          issue.location.latitude,
          issue.location.longitude
        );
        return {
          ...issue,
          distanceMeters: dist,
        };
      });

      // Sort closest first
      itemsWithDistance.sort((a, b) => a.distanceMeters - b.distanceMeters);

      setIssues(itemsWithDistance);
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || 'Failed to fetch civic issues');
    } finally {
      setIsLoading(false);
    }
  }, [lat, lng]);

  // Initial instant fetch on component mount
  useEffect(() => {
    fetchNearby();
  }, [fetchNearby]);

  // When live GPS updates, recalculate distances in-memory instantly without network lag
  useEffect(() => {
    if (rawIssuesRef.current.length > 0 && userLat && userLng) {
      const updated = rawIssuesRef.current.map((issue) => ({
        ...issue,
        distanceMeters: calculateDistanceMeters(
          userLat,
          userLng,
          issue.location.latitude,
          issue.location.longitude
        ),
      }));
      updated.sort((a, b) => a.distanceMeters - b.distanceMeters);
      setIssues(updated);
    }
  }, [userLat, userLng]);

  const handleUpvote = async (issueId: string) => {
    try {
      const result = await issuesApi.upvote(issueId);
      setIssues((prev) =>
        prev.map((item) =>
          item.id === issueId
            ? { ...item, upvotes_count: result.upvotes_count, has_upvoted: result.has_upvoted }
            : item
        )
      );
      return result;
    } catch (err) {
      console.error('Failed to upvote', err);
      throw err;
    }
  };

  return {
    issues,
    isLoading,
    error,
    refetch: fetchNearby,
    handleUpvote,
  };
}
