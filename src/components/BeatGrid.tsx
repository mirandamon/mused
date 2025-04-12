import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BeatPad from './BeatPad';
import { useAudio, DEFAULT_GRID_SIZE } from '@/context/AudioContext';
import { Play, Pause, Save, Music, Settings, Mic, Plus, Trash2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from '@/lib/utils';

interface BeatGridProps {
  initialGrid?: any[][];
  onSave?: (grid: any[][]) => void;
  readOnly?: boolean;
  isInitialized?: boolean;
}

const BeatGrid: React.FC<BeatGridProps> = ({
  initialGrid,
  onSave,
  readOnly = false,
  isInitialized = false,
}) => {
  const {
    sounds,
    isPlaying,
    currentBeat,
    bpm,
    setBpm,
    startSequence,
    stopSequence,
    createEmptyGrid,
    playSound,
    recordSound,
  } = useAudio();

  const [rows, setRows] = useState(DEFAULT_GRID_SIZE);
  const [cols, setCols] = useState(DEFAULT_GRID_SIZE);
  const [grid, setGrid] = useState(() => initialGrid || createEmptyGrid(rows, cols));
  const [selectedPad, setSelectedPad] = useState<{ row: number; col: number } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [soundSelectDialogOpen, setSoundSelectDialogOpen] = useState(false);
  const [animateControls, setAnimateControls] = useState(true);

  useEffect(() => {
    if (!initialGrid && (grid.length !== rows || grid[0]?.length !== cols)) {
      setGrid(createEmptyGrid(rows, cols));
    }
    
    const timer = setTimeout(() => {
      setAnimateControls(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [rows, cols, initialGrid]);

  const handleTogglePad = (row: number, col: number) => {
    if (readOnly) return;

    const newGrid = [...grid];
    newGrid[row] = [...newGrid[row]];
    
    if (newGrid[row][col].soundId) {
      newGrid[row][col] = {
        ...newGrid[row][col],
        active: !newGrid[row][col].active,
      };
    }
    
    setGrid(newGrid);
    
    if (isPlaying) {
      stopSequence();
      requestAnimationFrame(() => {
        startSequence(newGrid);
      });
    }
  };

  const handleSelectSound = (row: number, col: number) => {
    if (readOnly) return;
    setSelectedPad({ row, col });
    setSoundSelectDialogOpen(true);
  };

  const handleSoundSelect = (soundId: string | null) => {
    if (!selectedPad || readOnly) return;
    
    const currentSoundId = grid[selectedPad.row][selectedPad.col].soundId;
    const newSoundId = currentSoundId === soundId ? null : soundId;
    
    if (soundId && isInitialized && newSoundId !== null) {
      console.log("Testing sound:", soundId);
      playSound(soundId);
    }

    setGrid((prevGrid) => {
      const newGrid = [...prevGrid];
      newGrid[selectedPad.row] = [...newGrid[selectedPad.row]];
      newGrid[selectedPad.row][selectedPad.col] = {
        ...newGrid[selectedPad.row][selectedPad.col],
        soundId: newSoundId,
        active: newSoundId !== null,
      };
      return newGrid;
    });

    setSelectedPad(null);
    setSoundSelectDialogOpen(false);
  };

  const handleRecordSound = async () => {
    if (!selectedPad || readOnly) return;
    
    try {
      setIsRecording(true);
      toast("Recording... (tap anywhere to stop)", {
        duration: 3000,
      });
      
      const recordedSound = await recordSound();
      
      setGrid((prevGrid) => {
        const newGrid = [...prevGrid];
        newGrid[selectedPad.row] = [...newGrid[selectedPad.row]];
        newGrid[selectedPad.row][selectedPad.col] = {
          ...newGrid[selectedPad.row][selectedPad.col],
          soundId: recordedSound.id,
          active: true,
        };
        return newGrid;
      });
      
      setSoundSelectDialogOpen(false);
      toast.success("Recording saved!");
    } catch (error) {
      console.error('Recording failed:', error);
      toast.error("Failed to record sound. Please try again.");
    } finally {
      setIsRecording(false);
      setSelectedPad(null);
    }
  };

  const handleCloseRecording = () => {
    setIsRecording(false);
    setSoundSelectDialogOpen(false);
    setSelectedPad(null);
  };

  const handlePlay = () => {
    if (!isInitialized) {
      toast.error("Audio not fully initialized yet. Please wait a moment.");
      return;
    }
    
    if (isPlaying) {
      stopSequence();
    } else {
      console.log("Starting sequence with grid:", grid);
      startSequence(grid);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(grid);
    }
  };

  const addRow = () => {
    setRows(prevRows => {
      const newRows = prevRows + 1;
      setGrid(prevGrid => {
        const newRow = Array(cols).fill(0).map((_, col) => ({
          id: `pad-${prevRows}-${col}`,
          position: { row: prevRows, col },
          soundId: null,
          active: false,
        }));
        return [...prevGrid, newRow];
      });
      return newRows;
    });
  };

  const addColumn = () => {
    setCols(prevCols => {
      const newCols = prevCols + 1;
      setGrid(prevGrid => {
        return prevGrid.map((row, rowIndex) => [
          ...row,
          {
            id: `pad-${rowIndex}-${prevCols}`,
            position: { row: rowIndex, col: prevCols },
            soundId: null,
            active: false,
          }
        ]);
      });
      return newCols;
    });
  };

  const removeRow = () => {
    if (rows > 1) {
      setRows(prevRows => {
        const newRows = prevRows - 1;
        setGrid(prevGrid => prevGrid.slice(0, newRows));
        return newRows;
      });
    }
  };

  const removeColumn = () => {
    if (cols > 1) {
      setCols(prevCols => {
        const newCols = prevCols - 1;
        setGrid(prevGrid => {
          return prevGrid.map(row => row.slice(0, newCols));
        });
        return newCols;
      });
    }
  };

  const presetSounds = sounds.filter(sound => !sound.name.includes('Recording'));
  const recordedSounds = sounds.filter(sound => sound.name.includes('Recording'));
  
  const currentPadSoundId = selectedPad ? grid[selectedPad.row][selectedPad.col].soundId : null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center space-y-6 p-4 w-full max-w-md mx-auto"
    >
      <motion.div 
        className="flex items-center justify-between w-full bg-card/80 backdrop-blur-sm p-3 rounded-xl border shadow-sm"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={animateControls ? { scale: [1, 1.1, 1], transition: { duration: 1.5, repeat: 2 }} : {}}
        >
          <Button
            variant="outline"
            size="icon"
            onClick={handlePlay}
            className="h-10 w-10 rounded-full border-primary/30 bg-card shadow-sm relative overflow-hidden group"
            disabled={!isInitialized}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 text-primary" />
            ) : (
              <Play className="h-5 w-5 text-primary" />
            )}
            <motion.div 
              className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100"
              initial={false}
              animate={isPlaying ? { opacity: [0.1, 0.3, 0.1] } : { opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </Button>
        </motion.div>

        <div className="flex items-center space-x-2">
          {!readOnly && (
            <>
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-10 w-10 rounded-full border-muted/30 bg-card shadow-sm"
                  >
                    <Settings className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm border-none shadow-lg backdrop-blur-sm bg-card/95 rounded-xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Settings
                    </DialogTitle>
                  </DialogHeader>
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4 py-4"
                  >
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">BPM: {bpm}</span>
                      </div>
                      <Slider
                        defaultValue={[bpm]}
                        min={60}
                        max={180}
                        step={1}
                        onValueChange={(value) => setBpm(value[0])}
                        className="cursor-pointer"
                      />
                    </motion.div>
                    
                    <motion.div 
                      className="border-t pt-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <DialogTitle className="mb-4 text-base">Grid Size</DialogTitle>
                      <div className="flex flex-col space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Rows: {rows}</span>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={addRow}
                              className="h-8 w-8 rounded-md"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={removeRow}
                              disabled={rows <= 1}
                              className="h-8 w-8 rounded-md"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Columns: {cols}</span>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={addColumn}
                              className="h-8 w-8 rounded-md"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={removeColumn}
                              disabled={cols <= 1}
                              className="h-8 w-8 rounded-md"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </DialogContent>
              </Dialog>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={animateControls ? { scale: [1, 1.1, 1], transition: { duration: 1.5, delay: 0.5, repeat: 2 }} : {}}
              >
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSave}
                  className="h-10 px-4 rounded-full bg-primary hover:bg-primary/90 shadow-sm"
                  disabled={!isInitialized}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Publish
                </Button>
              </motion.div>
            </>
          )}
        </div>
      </motion.div>

      <motion.div
        className="bg-card/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {isPlaying && (
          <motion.div 
            className="absolute top-0 h-1 bg-primary/50 z-10"
            initial={{ width: '0%', left: '0%' }}
            animate={{ 
              width: `${100 / cols}%`,
              left: `${(currentBeat * 100) / cols}%` 
            }}
            transition={{ duration: 0.1 }}
          />
        )}
        
        <div
          className="grid gap-2 relative overflow-auto max-w-full"
          style={{
            gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            maxHeight: '70vh'
          }}
        >
          {grid.map((row, rowIndex) =>
            row.map((pad, colIndex) => (
              <BeatPad
                key={pad.id}
                id={pad.id}
                row={rowIndex}
                col={colIndex}
                isActive={pad.active}
                soundId={pad.soundId}
                currentBeat={currentBeat}
                isPlaying={isPlaying}
                onToggle={() => handleTogglePad(rowIndex, colIndex)}
                onSelectSound={() => handleSelectSound(rowIndex, colIndex)}
              />
            ))
          )}
        </div>
      </motion.div>

      <Dialog 
        open={soundSelectDialogOpen && !isRecording} 
        onOpenChange={(open) => {
          if (!open) {
            setSoundSelectDialogOpen(false);
            setSelectedPad(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md border-none bg-card/95 backdrop-blur-md shadow-xl rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Music className="h-5 w-5 mr-2" />
              {currentPadSoundId ? 'Change Sound' : 'Select Sound'}
            </DialogTitle>
            <DialogDescription>
              {currentPadSoundId 
                ? "Change sound or tap the current sound to remove it" 
                : "Choose a sound from the library or record a new one"}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="library">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="library">Sound Library</TabsTrigger>
              <TabsTrigger value="record">Record New</TabsTrigger>
            </TabsList>
            
            <TabsContent value="library" className="space-y-4 mt-3">
              {currentPadSoundId && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Current Sound</h3>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => handleSoundSelect(null)}
                      className="h-8 text-xs flex items-center gap-1 border-destructive/30 text-destructive hover:bg-destructive/5"
                    >
                      <X size={14} />
                      Remove Sound
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleSoundSelect(null)}
                    className="justify-start text-sm py-4 w-full mt-2 bg-primary/10 border-primary/30 hover:bg-primary/20"
                  >
                    <Music className="h-4 w-4 mr-2 text-primary" />
                    {sounds.find(s => s.id === currentPadSoundId)?.name || 'Unknown Sound'}
                  </Button>
                </motion.div>
              )}
              
              <AnimatePresence>
                {presetSounds.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-sm font-medium mb-2">Preset Sounds</h3>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {presetSounds.map((sound, index) => {
                        const isSelected = currentPadSoundId === sound.id;
                        return (
                          <motion.div 
                            key={sound.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                          >
                            <Button
                              variant={isSelected ? "secondary" : "outline"}
                              onClick={() => handleSoundSelect(sound.id)}
                              className={cn(
                                "justify-start text-sm py-6 w-full group",
                                isSelected 
                                  ? "bg-primary/10 border-primary/30 hover:bg-primary/20" 
                                  : "hover:bg-primary/5 hover:border-primary/30"
                              )}
                              disabled={!isInitialized}
                            >
                              <Music className={cn(
                                "h-4 w-4 mr-2", 
                                isSelected ? "text-primary" : "group-hover:text-primary"
                              )} />
                              {sound.name}
                            </Button>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <AnimatePresence>
                {recordedSounds.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="mt-4"
                  >
                    <h3 className="text-sm font-medium mb-2">Your Recordings</h3>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {recordedSounds.map((sound, index) => {
                        const isSelected = currentPadSoundId === sound.id;
                        return (
                          <motion.div 
                            key={sound.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: 0.1 + index * 0.05 }}
                          >
                            <Button
                              variant={isSelected ? "secondary" : "outline"}
                              onClick={() => handleSoundSelect(sound.id)}
                              className={cn(
                                "justify-start text-sm py-6 w-full",
                                isSelected 
                                  ? "bg-primary/10 border-primary/30" 
                                  : "hover:bg-primary/5 border-primary/30"
                              )}
                              disabled={!isInitialized}
                            >
                              <Mic className="h-4 w-4 mr-2 text-primary" />
                              {sound.name}
                            </Button>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {recordedSounds.length === 0 && presetSounds.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="py-4 text-center text-sm text-muted-foreground"
                >
                  <p>No sounds available</p>
                  <p>Switch to the "Record New" tab to create one</p>
                </motion.div>
              )}
            </TabsContent>
            
            <TabsContent value="record" className="space-y-4 mt-3">
              <motion.div 
                className="flex flex-col items-center justify-center py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={handleRecordSound}
                    className="rounded-full h-24 w-24 flex items-center justify-center border-primary/20 relative overflow-hidden group"
                    disabled={!isInitialized}
                  >
                    <Mic className="h-12 w-12 text-primary" />
                    <motion.div 
                      className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 rounded-full"
                      animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.3, 0.1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </Button>
                </motion.div>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Tap to start recording a new sound <span className="text-xs">(max 3 seconds)</span>
                </p>
              </motion.div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <AnimatePresence>
        {isRecording && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-50"
            onClick={handleCloseRecording}
          >
            <div className="relative w-16 h-16">
              <motion.div 
                className="absolute inset-0 rounded-full border-4 border-primary/30 border-t-primary"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-muted-foreground"
            >
              Recording sound...
            </motion.p>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-2 text-sm text-muted-foreground"
            >
              (Tap anywhere to stop)
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BeatGrid;
