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
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-orange-900 flex">
      {/* Left Panel - Selected Treasures */}
      <div className="w-80 bg-gradient-to-b from-slate-800 to-slate-900 border-r-2 border-amber-600 shadow-xl">
        <div className="p-6 border-b border-amber-600">
          <h2 className="text-2xl font-bold text-amber-300 flex items-center gap-2">
            <Scroll className="w-6 h-6" />
            Discovered Treasures
          </h2>
        </div>
        <div className="p-4 h-[calc(100vh-100px)] overflow-y-auto">
          {selectedTreasures.length === 0 ? (
            <div className="text-center text-slate-400 mt-8">
              <Scroll className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No treasures discovered yet</p>
              <p className="text-sm mt-2">Search for clues to begin your adventure!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedTreasures.map((treasure) => (
                <Card key={treasure.id} className="bg-gradient-to-r from-amber-100 to-yellow-100 border-amber-400 p-4 relative">
                  <Button
                    onClick={() => removeTreasure(treasure.id)}
                    className="absolute top-2 right-2 h-6 w-6 p-0 bg-red-500 hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                  <h3 className="font-bold text-amber-800 mb-2">{treasure.name}</h3>
                  <p className="text-sm text-amber-700 italic mb-2">"{treasure.clue}"</p>
                  <p className="text-xs text-amber-600">{treasure.description}</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Map Area */}
      <div className="flex-1 relative">
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <Button onClick={handleZoomIn} className="bg-amber-700 hover:bg-amber-600">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button onClick={handleZoomOut} className="bg-amber-700 hover:bg-amber-600">
            <ZoomOut className="w-4 h-4" />
          </Button>
        </div>
        
        <div 
          ref={mapRef}
          className="w-full h-screen overflow-hidden cursor-move relative bg-gradient-to-br from-green-800 via-green-700 to-emerald-800"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div 
            className="relative"
            style={{
              transform: `translate(${mapPosition.x}px, ${mapPosition.y}px) scale(${zoom})`,
              transformOrigin: 'center',
              width: '800px',
              height: '600px',
              backgroundImage: `
                radial-gradient(circle at 20% 20%, rgba(34, 197, 94, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(22, 163, 74, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 40% 60%, rgba(16, 124, 16, 0.3) 0%, transparent 50%)
              `
            }}
          >
            {/* Map terrain features */}
            <div className="absolute top-16 left-32 w-24 h-24 bg-gray-600 rounded-full shadow-lg"></div>
            <div className="absolute top-32 left-64 w-16 h-16 bg-gray-500 rounded-full shadow-md"></div>
            <div className="absolute bottom-32 right-48 w-32 h-8 bg-blue-400 rounded-full opacity-70"></div>
            <div className="absolute bottom-48 left-24 w-20 h-20 bg-green-600 rounded-full opacity-80"></div>
            
            {/* Treasure markers */}
            {selectedTreasures.map((treasure) => (
              <div
                key={treasure.id}
                className="absolute w-8 h-8 transform -translate-x-1/2 -translate-y-1/2 animate-bounce"
                style={{ left: treasure.x, top: treasure.y }}
              >
                <div className="w-full h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full border-2 border-amber-600 shadow-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-amber-300 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Search */}
      <div className="w-96 bg-gradient-to-b from-slate-800 to-slate-900 border-l-2 border-amber-600 shadow-xl">
        <div className="p-6 border-b border-amber-600">
          <h2 className="text-2xl font-bold text-amber-300 flex items-center gap-2 mb-4">
            <Search className="w-6 h-6" />
            Treasure Clues
          </h2>
          
          <div className="relative">
            <Input
              type="text"
              placeholder="Enter treasure clue..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="bg-slate-700 border-amber-600 text-amber-100 placeholder-amber-400 focus:border-amber-400"
            />
            
            {filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-slate-700 border border-amber-600 rounded-md mt-1 max-h-64 overflow-y-auto z-20">
                {filteredSuggestions.map((treasure) => (
                  <div
                    key={treasure.id}
                    onClick={() => handleTreasureSelect(treasure)}
                    className="p-3 hover:bg-amber-700 cursor-pointer border-b border-slate-600 last:border-b-0"
                  >
                    <div className="font-semibold text-amber-300">{treasure.name}</div>
                    <div className="text-sm text-amber-200 italic">"{treasure.clue}"</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="text-lg font-semibold text-amber-300 mb-4">Available Clues</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {treasures.map((treasure) => (
              <Card 
                key={treasure.id} 
                className={`p-3 cursor-pointer transition-all hover:scale-105 ${
                  selectedTreasures.find(t => t.id === treasure.id)
                    ? 'bg-green-100 border-green-400'
                    : 'bg-amber-50 border-amber-300 hover:bg-amber-100'
                }`}
                onClick={() => handleTreasureSelect(treasure)}
              >
                <h4 className="font-semibold text-amber-800">{treasure.name}</h4>
                <p className="text-sm text-amber-700 italic">"{treasure.clue}"</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;