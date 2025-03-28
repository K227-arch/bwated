import { supabase } from '@/lib/supabaseClient';

export const canAffordTokens = async (tokenCount) => {
  const user = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not logged in');
  }
console.log(user)
  try {
    const { data, error } = await supabase
      .from('users')  
      .select('credit')
      .eq('auth_id', user.data.user.id)
      .single();

    if (error) throw error;

    const credit = data.credit;
    const tokensPerCredit = 10000;
    const canAfford = tokenCount <= (credit * tokensPerCredit);
    console.log(canAfford)
    // Update remaining credit after token usage
    if (canAfford) {
      const newCredit = (credit - (tokenCount / tokensPerCredit)).toFixed(3);
      const updateResult = await supabase
        .from('users')
        .update({ credit: newCredit })
        .eq('auth_id', user.data.user.id);

      if (updateResult.error) {
        console.error('Error updating user credit:', updateResult.error);
        return false; // Return false if the update fails
      }else{
        return true;
      }
    }
  } catch (error) {
    console.error('Error fetching user credit:', error);
    return false;
  }
};
