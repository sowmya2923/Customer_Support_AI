import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';

export const useMessages = (ticketId) => {
  const queryClient = useQueryClient();

  // Query to fetch all messages in a specific ticket chat
  const messagesQuery = useQuery({
    queryKey: ['messages', ticketId],
    queryFn: async () => {
      const { data } = await api.get(`/messages/ticket/${ticketId}`);
      return data.messages;
    },
    enabled: !!ticketId,
    refetchInterval: 5000, // Quick polling (5 seconds) to make the chat feel real-time!
  });

  // Mutation to send a new message in the ticket chat
  const sendMessageMutation = useMutation({
    mutationFn: async (formData) => {
      // Must use multipart/form-data for attachments
      const { data } = await api.post('/messages', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data.data;
    },
    onSuccess: () => {
      // Refresh the specific ticket messages list
      queryClient.invalidateQueries({ queryKey: ['messages', ticketId] });
      // Also invalidate tickets list to reflect last message timing
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });

  return {
    messages: messagesQuery.data || [],
    isLoadingMessages: messagesQuery.isLoading,
    messagesError: messagesQuery.error,

    sendMessage: sendMessageMutation.mutateAsync,
    isSendingMessage: sendMessageMutation.isPending,
  };
};
