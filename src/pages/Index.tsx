import React, { useState, useRef, useEffect } from 'react';
import { Search, Map as MapIcon, Scroll, X, ZoomIn, ZoomOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [selectedTreasure, setSelectedTreasure] = useState<Treasure | null>(null);
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

  const handleTreasureClick = (treasure: Treasure, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent map dragging when clicking pin
    setSelectedTreasure(treasure);
  };

  return (
    <div className="min-h-screen bg-[#050A14] flex flex-col xl:flex-row overflow-x-hidden p-3 gap-3">
      {/* Treasure Clues Section - Top on mobile, Right on desktop */}
      <div className="w-full xl:w-96 bg-[#0A1128] border-b xl:border-l border-[#1E3A8A]/30 shadow-xl flex flex-col h-[35vh] xl:h-screen order-first xl:order-last rounded-lg">
        <div className="p-4 xl:p-6 border-b border-[#1E3A8A]/30">
          <h2 className="text-xl xl:text-2xl font-bold text-white flex items-center gap-2 mb-3 xl:mb-4">
            <Search className="w-5 h-5 xl:w-6 xl:h-6 text-[#FCD34D]" />
            Treasure Clues
          </h2>
          
          <div className="relative">
            <Input
              type="text"
              placeholder="Enter treasure clue..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="bg-[#1E3A8A]/10 border-[#1E3A8A]/30 text-white placeholder-gray-400 focus:border-[#FCD34D] focus:ring-[#FCD34D] text-sm xl:text-base"
            />
            
            {filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-[#0A1128]/95 border border-[#1E3A8A]/30 rounded-md mt-1 max-h-48 xl:max-h-64 overflow-y-auto z-20 backdrop-blur-sm">
                {filteredSuggestions.map((treasure) => (
                  <div
                    key={treasure.id}
                    onClick={() => handleTreasureSelect(treasure)}
                    className="p-2 xl:p-3 hover:bg-[#1E3A8A]/20 cursor-pointer border-b border-[#1E3A8A]/20 last:border-b-0"
                  >
                    <div className="font-semibold text-white text-sm xl:text-base">{treasure.name}</div>
                    <div className="text-xs xl:text-sm text-gray-300 italic">"{treasure.clue}"</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="px-4 xl:px-6 pt-4 xl:pt-6">
            <h3 className="text-base xl:text-lg font-semibold text-white">Available Clues</h3>
          </div>
          <div className="flex-1 overflow-y-auto px-4 xl:px-6 pb-4 xl:pb-6 space-y-2 xl:space-y-3 mt-2 xl:mt-4">
            {treasures.map((treasure) => (
              <Card 
                key={treasure.id} 
                onClick={() => handleTreasureSelect(treasure)}
                className={`p-2 xl:p-3 cursor-pointer transition-all hover:scale-105 ${
                  selectedTreasures.find(t => t.id === treasure.id)
                    ? 'bg-[#1E3A8A]/20 border-[#FCD34D]'
                    : 'bg-[#1E3A8A]/10 border-[#1E3A8A]/30 hover:bg-[#1E3A8A]/20'
                }`}
              >
                <h4 className="font-semibold text-white text-sm xl:text-base">{treasure.name}</h4>
                <p className="text-xs xl:text-sm text-gray-300 italic">"{treasure.clue}"</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Main Map Area */}
      <div className="flex-1 relative min-h-[40vh] xl:min-h-screen overflow-hidden order-2 rounded-lg">
        <div className="absolute top-2 left-2 xl:top-4 xl:left-4 z-10 flex gap-2">
          <Button onClick={handleZoomIn} className="bg-[#1E3A8A]/20 hover:bg-[#1E3A8A]/30 border border-[#1E3A8A]/30 h-8 w-8 xl:h-10 xl:w-10 p-0">
            <ZoomIn className="w-4 h-4 text-white" />
          </Button>
          <Button onClick={handleZoomOut} className="bg-[#1E3A8A]/20 hover:bg-[#1E3A8A]/30 border border-[#1E3A8A]/30 h-8 w-8 xl:h-10 xl:w-10 p-0">
            <ZoomOut className="w-4 h-4 text-white" />
          </Button>
        </div>
        
        <div 
          ref={mapRef}
          className={`w-full h-full overflow-hidden relative bg-[#050A14] flex items-center justify-center touch-none ${isDragging ? 'cursor-grabbing' : ''}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={(e) => {
            e.preventDefault();
            const touch = e.touches[0];
            handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY } as React.MouseEvent);
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            const touch = e.touches[0];
            handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY } as React.MouseEvent);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            handleMouseUp();
          }}
        >
          <div 
            className="relative"
            style={{
              transformOrigin: 'center',
              width: 'min(90vw, 900px)',
              height: 'min(90vw, 900px)',
              backgroundImage: `url('/map.webp')`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              position: 'relative',
              transform: `translate(${mapPosition.x}px, ${mapPosition.y}px) scale(${zoom})`,
            }}
          >
            {/* Treasure markers */}
            {selectedTreasures.map((treasure) => {
              const mapSize = Math.min(window.innerWidth * 0.9, 900);
              const scale = mapSize / 900;
              const scaledX = treasure.x * scale;
              const scaledY = treasure.y * scale;
              
              return (
                <div
                  key={treasure.id}
                  className="absolute w-4 h-4 xl:w-5 xl:h-5 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform"
                  style={{ 
                    left: `${scaledX}px`, 
                    top: `${scaledY}px`,
                  }}
                  onClick={(e) => handleTreasureClick(treasure, e)}
                >
                  <div className="w-full h-full bg-gradient-to-r from-[#FCD34D] to-[#F59E0B] rounded-full border-2 border-[#FCD34D] shadow-lg flex items-center justify-center">
                    <div className="w-1 h-1 xl:w-1.5 xl:h-1.5 bg-white rounded-full"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Left Panel - Selected Treasures - Bottom on mobile, Left on desktop */}
      <div className="w-full xl:w-80 bg-[#0A1128] border-t xl:border-r border-[#1E3A8A]/30 shadow-xl flex flex-col h-[25vh] xl:h-screen order-last xl:order-first rounded-lg">
        <div className="p-4 xl:p-6 border-b border-[#1E3A8A]/30">
          <h2 className="text-xl xl:text-2xl font-bold text-white flex items-center gap-2">
            <Scroll className="w-5 h-5 xl:w-6 xl:h-6 text-[#FCD34D]" />
            Selected Treasures
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-3 xl:p-4">
          {selectedTreasures.length === 0 ? (
            <div className="text-center text-gray-400 mt-4 xl:mt-8">
              <Scroll className="w-8 h-8 xl:w-12 xl:h-12 mx-auto mb-2 xl:mb-4 opacity-50" />
              <p>No treasures selected yet</p>
              <p className="text-sm mt-1 xl:mt-2">Search for clues to begin your adventure!</p>
            </div>
          ) : (
            <div className="space-y-3 xl:space-y-4">
              {selectedTreasures.map((treasure) => (
                <Card key={treasure.id} className="bg-[#1E3A8A]/10 border-[#1E3A8A]/30 p-3 xl:p-4 relative backdrop-blur-sm">
                  <Button
                    onClick={() => removeTreasure(treasure.id)}
                    className="absolute top-2 right-2 h-5 w-5 xl:h-6 xl:w-6 p-0 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30"
                  >
                    <X className="w-2.5 h-2.5 xl:w-3 xl:h-3 text-red-400" />
                  </Button>
                  <h3 className="font-bold text-white mb-1 xl:mb-2 text-sm xl:text-base">{treasure.name}</h3>
                  <p className="text-xs xl:text-sm text-gray-300 italic mb-1 xl:mb-2">"{treasure.clue}"</p>
                  <p className="text-xs text-gray-400">{treasure.description}</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Treasure Details Modal */}
      <Dialog open={!!selectedTreasure} onOpenChange={() => setSelectedTreasure(null)}>
        <DialogContent className="sm:max-w-[425px] bg-[#0A1128] border-[#1E3A8A]/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-[#FCD34D]" />
              {selectedTreasure?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedTreasure?.picture_url && (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                <img
                  src={selectedTreasure.picture_url}
                  alt={selectedTreasure.name}
                  className="object-cover w-full h-full"
                />
              </div>
            )}
            <div className="space-y-2">
              <div>
                <h3 className="text-sm font-semibold text-[#FCD34D]">Clue</h3>
                <p className="text-sm text-gray-300 italic">"{selectedTreasure?.clue}"</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#FCD34D]">Description</h3>
                <p className="text-sm text-gray-300">{selectedTreasure?.description}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;