import { supabase } from './supabaseClient';

// Company entity functions
export const Company = {
  // List companies with optional sorting and filtering
  list: async (sortBy = '-created_date', limit = null) => {
    let query = supabase
      .from('companies')
      .select('*');
    
    // Handle sorting
    if (sortBy.startsWith('-')) {
      const field = sortBy.substring(1);
      query = query.order(field, { ascending: false });
    } else {
      query = query.order(sortBy, { ascending: true });
    }
    
    // Handle limit
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Error fetching companies: ${error.message}`);
    }
    
    return data || [];
  },

  // Get a single company by ID
  get: async (id) => {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      throw new Error(`Error fetching company: ${error.message}`);
    }
    
    return data;
  },

  // Create a new company
  create: async (companyData) => {
    const { data, error } = await supabase
      .from('companies')
      .insert([companyData])
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error creating company: ${error.message}`);
    }
    
    return data;
  },

  // Update a company
  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error updating company: ${error.message}`);
    }
    
    return data;
  },

  // Delete a company
  delete: async (id) => {
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw new Error(`Error deleting company: ${error.message}`);
    }
    
    return true;
  },

  // Search companies
  search: async (searchTerm, filters = {}) => {
    let query = supabase
      .from('companies')
      .select('*');
    
    // Add text search
    if (searchTerm) {
      query = query.or(`company_name.ilike.%${searchTerm}%,business_email.ilike.%${searchTerm}%,contact_person.ilike.%${searchTerm}%`);
    }
    
    // Add filters
    if (filters.industry && filters.industry !== 'all') {
      query = query.eq('industry', filters.industry);
    }
    
    if (filters.status && filters.status !== 'all') {
      query = query.eq('registration_status', filters.status);
    }
    
    if (filters.kyc_status && filters.kyc_status !== 'all') {
      query = query.eq('kyc_status', filters.kyc_status);
    }
    
    const { data, error } = await query.order('created_date', { ascending: false });
    
    if (error) {
      throw new Error(`Error searching companies: ${error.message}`);
    }
    
    return data || [];
  },

  // Search companies using basic info view (for payment selection)
  searchBasic: async (searchTerm, filters = {}) => {
    let query = supabase
      .from('company_basic_info')
      .select('*');
    
    // Add text search
    if (searchTerm) {
      query = query.or(`company_name.ilike.%${searchTerm}%,business_email.ilike.%${searchTerm}%,contact_person.ilike.%${searchTerm}%`);
    }
    
    // Add filters
    if (filters.industry && filters.industry !== 'all') {
      query = query.eq('industry', filters.industry);
    }
    
    if (filters.status && filters.status !== 'all') {
      query = query.eq('registration_status', filters.status);
    }
    
    if (filters.kyc_status && filters.kyc_status !== 'all') {
      query = query.eq('kyc_status', filters.kyc_status);
    }
    
    const { data, error } = await query.order('company_name', { ascending: true });
    
    if (error) {
      throw new Error(`Error searching companies: ${error.message}`);
    }
    
    return data || [];
  }
};

// Transaction entity functions
export const Transaction = {
  // List transactions with optional sorting and filtering
  list: async (sortBy = '-created_date', limit = null) => {
    let query = supabase
      .from('transactions')
      .select(`
        *,
        from_company:companies!from_company_id(company_name),
        to_company:companies!to_company_id(company_name)
      `);
    
    // Handle sorting
    if (sortBy.startsWith('-')) {
      const field = sortBy.substring(1);
      query = query.order(field, { ascending: false });
    } else {
      query = query.order(sortBy, { ascending: true });
    }
    
    // Handle limit
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Error fetching transactions: ${error.message}`);
    }
    
    return data || [];
  },

  // Get a single transaction by ID
  get: async (id) => {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        from_company:companies!from_company_id(company_name),
        to_company:companies!to_company_id(company_name)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      throw new Error(`Error fetching transaction: ${error.message}`);
    }
    
    return data;
  },

  // Create a new transaction
  create: async (transactionData) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert([transactionData])
      .select(`
        *,
        from_company:companies!from_company_id(company_name),
        to_company:companies!to_company_id(company_name)
      `)
      .single();
    
    if (error) {
      throw new Error(`Error creating transaction: ${error.message}`);
    }
    
    return data;
  },

  // Update a transaction
  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        from_company:companies!from_company_id(company_name),
        to_company:companies!to_company_id(company_name)
      `)
      .single();
    
    if (error) {
      throw new Error(`Error updating transaction: ${error.message}`);
    }
    
    return data;
  },

  // Get transactions for a specific company
  getByCompany: async (companyId, limit = null) => {
    let query = supabase
      .from('transactions')
      .select(`
        *,
        from_company:companies!from_company_id(company_name),
        to_company:companies!to_company_id(company_name)
      `)
      .or(`from_company_id.eq.${companyId},to_company_id.eq.${companyId}`)
      .order('created_date', { ascending: false });
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Error fetching company transactions: ${error.message}`);
    }
    
    return data || [];
  },

  // Get transaction statistics
  getStats: async (companyId = null) => {
    let query = supabase
      .from('transactions')
      .select('amount, status, created_date');
    
    if (companyId) {
      query = query.or(`from_company_id.eq.${companyId},to_company_id.eq.${companyId}`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Error fetching transaction stats: ${error.message}`);
    }
    
    const stats = {
      total: data.length,
      completed: data.filter(t => t.status === 'completed').length,
      pending: data.filter(t => t.status === 'pending').length,
      failed: data.filter(t => t.status === 'failed').length,
      totalVolume: data
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + (t.amount || 0), 0),
      averageAmount: 0
    };
    
    if (stats.completed > 0) {
      stats.averageAmount = stats.totalVolume / stats.completed;
    }
    
    return stats;
  }
};

// User entity functions
export const User = {
  // Get current user profile
  getCurrent: async () => {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        company:companies(id, company_name, wallet_balance)
      `)
      .single();
    
    if (error) {
      throw new Error(`Error fetching user: ${error.message}`);
    }
    
    return data;
  },

  // Create a new user
  create: async (userData) => {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select(`
        *,
        company:companies(id, company_name, wallet_balance)
      `)
      .single();
    
    if (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
    
    return data;
  },

  // Update user profile
  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        company:companies(id, company_name, wallet_balance)
      `)
      .single();
    
    if (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
    
    return data;
  }
};