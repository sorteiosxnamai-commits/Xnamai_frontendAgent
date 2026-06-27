let customersSynced = new Set<string>();

export const customerStore = {
  markSynced: (id: string) => customersSynced.add(id),
  isSyncedOverride: (id: string) => customersSynced.has(id),
};

let editedCustomers: Record<string, Partial<{ name: string; email: string; phone: string; company: string; city: string; notes: string }>> = {};

export const customerEditStore = {
  save: (id: string, data: (typeof editedCustomers)[string]) => {
    editedCustomers[id] = { ...editedCustomers[id], ...data };
  },
  get: (id: string) => editedCustomers[id],
};
