import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';

export const useKB = (searchQuery = '', filterCategory = '') => {
  const queryClient = useQueryClient();

  // Query to get articles list, dynamically fetching whenever search term or category changes
  const articlesQuery = useQuery({
    queryKey: ['kbArticles', { search: searchQuery, category: filterCategory }],
    queryFn: async () => {
      let url = '/kb';
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filterCategory) params.append('category', filterCategory);
      
      const paramStr = params.toString();
      if (paramStr) url += `?${paramStr}`;
      
      const { data } = await api.get(url);
      return data.articles;
    },
  });

  // Mutation to create a new Knowledge Base article
  const createArticleMutation = useMutation({
    mutationFn: async ({ title, content, category, tags }) => {
      const { data } = await api.post('/kb', { title, content, category, tags });
      return data.article;
    },
    onSuccess: () => {
      // Invalidate articles list to reflect the new article
      queryClient.invalidateQueries({ queryKey: ['kbArticles'] });
    },
  });

  // Mutation to fetch AI suggested replies for a ticket
  const aiSuggestMutation = useMutation({
    mutationFn: async (ticketId) => {
      const { data } = await api.post(`/ai/suggest/${ticketId}`);
      return data; // returns { suggestedReply, referencedArticles }
    },
  });

  return {
    articles: articlesQuery.data || [],
    isLoadingArticles: articlesQuery.isLoading,
    articlesError: articlesQuery.error,

    createArticle: createArticleMutation.mutateAsync,
    isCreatingArticle: createArticleMutation.isPending,

    getAISuggestion: aiSuggestMutation.mutateAsync,
    isGettingAISuggestion: aiSuggestMutation.isPending,
  };
};
