import React, { useState, useRef, useEffect } from 'react';
import { Search, Map as MapIcon, Scroll, X, ZoomIn, ZoomOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface Treasure {
  id: string;
  name: string;
  clue: string;
  x: number;
  y: number;
  description: string;
  picture_url?: string;
}

const Index = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedTreasures, setSelectedTreasures] = useState<Treasure[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Treasure[]>([]);
  const [zoom, setZoom] = useState(1);
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [treasures, setTreasures] = useState<Treasure[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);

  // Fetch treasures from Supabase
  useEffect(() => {
    const fetchTreasures = async () => {
      const { data, error } = await supabase
        .from('treasures')
        .select('*');
      
      if (error) {
        console.error('Error fetching treasures:', error);
        return;
      }

      if (data) {
        setTreasures(data);
      }
    };

    fetchTreasures();
  }, []);

  // Filter suggestions based on search text
  useEffect(() => {
    if (searchText.trim()) {
      const filtered = treasures.filter(treasure =>
        treasure.clue.toLowerCase().includes(searchText.toLowerCase()) ||
        treasure.name.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions([]);
    }
  }, [searchText, treasures]);

  const handleTreasureSelect = (treasure: Treasure) => {
    if (!selectedTreasures.find(t => t.id === treasure.id)) {
      setSelectedTreasures([...selectedTreasures, treasure]);
    }
    setSearchText('');
    setFilteredSuggestions([]);
  };

  const removeTreasure = (treasureId: string) => {
    setSelectedTreasures(selectedTreasures.filter(t => t.id !== treasureId));
  };

  const handleZoomIn = () => {
    setZoom(Math.min(zoom * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom / 1.2, 0.5));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - mapPosition.x, y: e.clientY - mapPosition.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setMapPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="min-h-screen bg-[#050A14] flex">
      {/* Left Panel - Selected Treasures */}
      <div className="w-80 bg-[#0A1128] border-r border-[#1E3A8A]/30 shadow-xl">
        <div className="p-6 border-b border-[#1E3A8A]/30">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Scroll className="w-6 h-6 text-[#FCD34D]" />
            Discovered Treasures
          </h2>
        </div>
        <div className="p-4 h-[calc(100vh-100px)] overflow-y-auto">
          {selectedTreasures.length === 0 ? (
            <div className="text-center text-gray-400 mt-8">
              <Scroll className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No treasures discovered yet</p>
              <p className="text-sm mt-2">Search for clues to begin your adventure!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedTreasures.map((treasure) => (
                <Card key={treasure.id} className="bg-[#1E3A8A]/10 border-[#1E3A8A]/30 p-4 relative backdrop-blur-sm">
                  <Button
                    onClick={() => removeTreasure(treasure.id)}
                    className="absolute top-2 right-2 h-6 w-6 p-0 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30"
                  >
                    <X className="w-3 h-3 text-red-400" />
                  </Button>
                  <h3 className="font-bold text-white mb-2">{treasure.name}</h3>
                  <p className="text-sm text-gray-300 italic mb-2">"{treasure.clue}"</p>
                  <p className="text-xs text-gray-400">{treasure.description}</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Map Area */}
      <div className="flex-1 relative">
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <Button onClick={handleZoomIn} className="bg-[#1E3A8A]/20 hover:bg-[#1E3A8A]/30 border border-[#1E3A8A]/30">
            <ZoomIn className="w-4 h-4 text-white" />
          </Button>
          <Button onClick={handleZoomOut} className="bg-[#1E3A8A]/20 hover:bg-[#1E3A8A]/30 border border-[#1E3A8A]/30">
            <ZoomOut className="w-4 h-4 text-white" />
          </Button>
        </div>
        
        <div 
          ref={mapRef}
          className="w-full h-screen overflow-hidden cursor-move relative bg-[#050A14]"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div 
            className="relative"
            style={{
              transformOrigin: 'center',
              width: '900px',
              height: '900px',
              backgroundImage: `url('/map.webp')`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) translate(${mapPosition.x}px, ${mapPosition.y}px) scale(${zoom})`,
            }}
          >
            {/* Treasure markers */}
            {selectedTreasures.map((treasure) => (
              <div
                key={treasure.id}
                className="absolute w-6 h-6 transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: treasure.x, top: treasure.y }}
              >
                <div className="w-full h-full bg-gradient-to-r from-[#FCD34D] to-[#F59E0B] rounded-full border-2 border-[#FCD34D] shadow-lg flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Search */}
      <div className="w-96 bg-[#0A1128] border-l border-[#1E3A8A]/30 shadow-xl flex flex-col h-screen">
        <div className="p-6 border-b border-[#1E3A8A]/30">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-4">
            <Search className="w-6 h-6 text-[#FCD34D]" />
            Treasure Clues
          </h2>
          
          <div className="relative">
            <Input
              type="text"
              placeholder="Enter treasure clue..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="bg-[#1E3A8A]/10 border-[#1E3A8A]/30 text-white placeholder-gray-400 focus:border-[#FCD34D] focus:ring-[#FCD34D]"
            />
            
            {filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-[#0A1128]/95 border border-[#1E3A8A]/30 rounded-md mt-1 max-h-64 overflow-y-auto z-20 backdrop-blur-sm">
                {filteredSuggestions.map((treasure) => (
                  <div
                    key={treasure.id}
                    onClick={() => handleTreasureSelect(treasure)}
                    className="p-3 hover:bg-[#1E3A8A]/20 cursor-pointer border-b border-[#1E3A8A]/20 last:border-b-0"
                  >
                    <div className="font-semibold text-white">{treasure.name}</div>
                    <div className="text-sm text-gray-300 italic">"{treasure.clue}"</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-6 pb-2">
            <h3 className="text-lg font-semibold text-white">Available Clues</h3>
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3">
            {treasures.map((treasure) => (
              <Card 
                key={treasure.id} 
                onClick={() => handleTreasureSelect(treasure)}
                className={`p-3 cursor-pointer transition-all hover:scale-105 ${
                  selectedTreasures.find(t => t.id === treasure.id)
                    ? 'bg-[#1E3A8A]/20 border-[#FCD34D]'
                    : 'bg-[#1E3A8A]/10 border-[#1E3A8A]/30 hover:bg-[#1E3A8A]/20'
                }`}
              >
                <h4 className="font-semibold text-white">{treasure.name}</h4>
                <p className="text-sm text-gray-300 italic">"{treasure.clue}"</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;