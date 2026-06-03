import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";

export default function TanstackProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 50,
        retry: false,
        refetchOnMount: false,
      },
    },
    queryCache: new QueryCache({
      onError: (error) => console.error(`Global query error: ${error}`),
    }),
    mutationCache: new MutationCache({
      onError: (error) => console.error(`Global mutation error: ${error}`),
    }),
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
