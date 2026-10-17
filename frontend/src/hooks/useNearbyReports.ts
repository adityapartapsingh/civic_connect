import { useState, useEffect, useCallback } from 'react';
import { Issue } from '../types';
import { issuesApi } from '../services/api';
import { calculateDistanceMeters } from '../utils/helpers';

export interface NearbyIssueItem extends Issue {
  distanceMeters: number;
}

export function useNearbyReports(
  userLat?: number,
  userLng?: number,
  radiusMeters = 500
) {
  const [issues, setIssues] = useState<NearbyIssueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNearby = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const all = await issuesApi.getAll();
      const lat = userLat ?? 12.9352;
      const lng = userLng ?? 77.6245;

      const itemsWithDistance: NearbyIssueItem[] = all.map((issue) => {
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

      // Filter by radius and sort by closest first
      const nearby = itemsWithDistance
        .filter((i) => i.distanceMeters <= radiusMeters)
        .sort((a, b) => a.distanceMeters - b.distanceMeters);

      setIssues(nearby);
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || 'Failed to fetch nearby issues');
    } finally {
      setIsLoading(false);
    }
  }, [userLat, userLng, radiusMeters]);

  useEffect(() => {
    fetchNearby();
  }, [fetchNearby]);

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
