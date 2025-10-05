import { supabase } from './supabaseClient';

// Execute payment function
export const executePayment = async (paymentData) => {
  try {
    // Create transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert([{
        from_company_id: paymentData.from_company_id,
        to_company_id: paymentData.to_company_id,
        from_company_name: paymentData.from_company_name,
        to_company_name: paymentData.to_company_name,
        amount: paymentData.amount,
        description: paymentData.description,
        status: 'pending',
        created_by: paymentData.created_by,
        transaction_type: 'payment'
      }])
      .select()
      .single();

    if (transactionError) {
      throw new Error(`Error creating transaction: ${transactionError.message}`);
    }

    // Here you would integrate with Circle API for actual payment processing
    // For now, we'll simulate a successful payment
    const { data: updatedTransaction, error: updateError } = await supabase
      .from('transactions')
      .update({
        status: 'completed',
        transaction_hash: `0x${Math.random().toString(16).substr(2, 64)}`
      })
      .eq('id', transaction.id)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Error updating transaction: ${updateError.message}`);
    }

    return updatedTransaction;
  } catch (error) {
    console.error('Payment execution error:', error);
    throw error;
  }
};

// Create wallet function
export const createWallet = async (companyId) => {
  try {
    // Generate a mock wallet address
    const walletAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
    
    // Update company with wallet address
    const { data, error } = await supabase
      .from('companies')
      .update({
        wallet_address: walletAddress,
        wallet_balance: 1000.00 // Initial balance
      })
      .eq('id', companyId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating wallet: ${error.message}`);
    }

    return {
      wallet_address: walletAddress,
      wallet_balance: 1000.00,
      company: data
    };
  } catch (error) {
    console.error('Wallet creation error:', error);
    throw error;
  }
};

