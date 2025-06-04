
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Treasure {
  id: string;
  name: string;
  clue: string;
  x: number;
  y: number;
  description: string;
}

export const useTreasures = () => {
  const [treasures, setTreasures] = useState<Treasure[]>([]);
  const [selectedTreasures, setSelectedTreasures] = useState<Treasure[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch all treasures
  useEffect(() => {
    const fetchTreasures = async () => {
      const { data, error } = await supabase
        .from('treasures')
        .select('*');

      if (error) {
        console.error('Error fetching treasures:', error);
        toast({
          title: "Error",
          description: "Failed to load treasures",
          variant: "destructive",
        });
      } else {
        setTreasures(data || []);
      }
      setLoading(false);
    };

    fetchTreasures();
  }, [toast]);

  // Fetch user's discovered treasures
  useEffect(() => {
    if (!user) {
      setSelectedTreasures([]);
      return;
    }

    const fetchUserDiscoveries = async () => {
      const { data, error } = await supabase
        .from('user_discoveries')
        .select(`
          treasure_id,
          treasures (
            id,
            name,
            clue,
            x,
            y,
            description
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user discoveries:', error);
      } else {
        const discovered = data?.map(d => d.treasures).filter(Boolean) || [];
        setSelectedTreasures(discovered as Treasure[]);
      }
    };

    fetchUserDiscoveries();
  }, [user]);

  const addTreasure = async (treasure: Treasure) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save treasures",
        variant: "destructive",
      });
      return false;
    }

    if (selectedTreasures.find(t => t.id === treasure.id)) {
      return false; // Already selected
    }

    const { error } = await supabase
      .from('user_discoveries')
      .insert({
        user_id: user.id,
        treasure_id: treasure.id,
      });

    if (error) {
      console.error('Error adding treasure:', error);
      toast({
        title: "Error",
        description: "Failed to save treasure",
        variant: "destructive",
      });
      return false;
    }

    setSelectedTreasures([...selectedTreasures, treasure]);
    toast({
      title: "Treasure Discovered!",
      description: `You found the ${treasure.name}!`,
    });
    return true;
  };

  const removeTreasure = async (treasureId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('user_discoveries')
      .delete()
      .eq('user_id', user.id)
      .eq('treasure_id', treasureId);

    if (error) {
      console.error('Error removing treasure:', error);
      toast({
        title: "Error",
        description: "Failed to remove treasure",
        variant: "destructive",
      });
    } else {
      setSelectedTreasures(selectedTreasures.filter(t => t.id !== treasureId));
    }
  };

  return {
    treasures,
    selectedTreasures,
    loading,
    addTreasure,
    removeTreasure,
  };
};
