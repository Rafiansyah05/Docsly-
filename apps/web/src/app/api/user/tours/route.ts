import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { tourId } = await req.json();
    if (!tourId) {
      return NextResponse.json({ error: 'Tour ID is required' }, { status: 400 });
    }

    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ambil data profiles yang ada
    const { data: profile } = await supabase.from('profiles').select('tours_status').eq('id', user.id).single();
    
    let currentToursStatus = profile?.tours_status || {};
    if (typeof currentToursStatus !== 'object' || Array.isArray(currentToursStatus)) {
      currentToursStatus = {};
    }

    // Update state tour ini jadi true
    currentToursStatus[tourId] = true;

    // Simpan kembali
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ tours_status: currentToursStatus })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating tour status:', updateError);
      return NextResponse.json({ error: 'Failed to update tour status' }, { status: 500 });
    }

    return NextResponse.json({ success: true, tours_status: currentToursStatus });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
