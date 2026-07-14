import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';

/**
 * Custom hook to manage all ticket transactions via TanStack Query
 */
export const useTickets = (ticketId = null, filters = {}) => {
  const queryClient = useQueryClient();

  // 1. Query to fetch all tickets (filtered by status or priority if provided)
  const ticketsQuery = useQuery({
    queryKey: ['tickets', filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters).toString();
      const { data } = await api.get(`/tickets?${params}`);
      return data.tickets;
    },
    refetchInterval: 15000, // Background poll every 15s to fetch new incoming support tickets
  });

  // 2. Query to fetch a single ticket's details
  const ticketDetailQuery = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: async () => {
      const { data } = await api.get(`/tickets/${ticketId}`);
      return data.ticket;
    },
    enabled: !!ticketId, // Only fetch if ticketId is provided
  });

  // 3. Mutation to create a new ticket
  const createTicketMutation = useMutation({
    mutationFn: async (formData) => {
      // Must use multipart/form-data for image attachments
      const { data } = await api.post('/tickets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data.ticket;
    },
    onSuccess: () => {
      // Invalidate the 'tickets' query key to trigger a background refetch
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });

  // 4. Mutation to update an existing ticket (status, priority, assignment)
  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, status, priority, category, department, assignedAgentId }) => {
      const { data } = await api.put(`/tickets/${id}`, {
        status,
        priority,
        category,
        department,
        assignedAgentId,
      });
      return data.ticket;
    },
    onSuccess: (updatedTicket) => {
      // Invalidate specific ticket query and the broad tickets list query
      queryClient.invalidateQueries({ queryKey: ['ticket', updatedTicket._id] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });

  return {
    tickets: ticketsQuery.data || [],
    isLoadingTickets: ticketsQuery.isLoading,
    ticketsError: ticketsQuery.error,
    
    ticket: ticketDetailQuery.data,
    isLoadingTicket: ticketDetailQuery.isLoading,
    ticketError: ticketDetailQuery.error,

    createTicket: createTicketMutation.mutateAsync,
    isCreatingTicket: createTicketMutation.isPending,

    updateTicket: updateTicketMutation.mutateAsync,
    isUpdatingTicket: updateTicketMutation.isPending,
  };
};



