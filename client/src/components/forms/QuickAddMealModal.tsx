import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Plus, Check, Utensils } from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';
import { FoodItem } from '../../types';

interface QuickAddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export const QuickAddMealModal: React.FC<QuickAddMealModalProps> = ({
  isOpen,
  onClose,
  defaultCategory = 'breakfast',
}) => {
  const { searchFoods, addMeal } = useDiary();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [category, setCategory] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>(defaultCategory);
  const [portion, setPortion] = useState<number>(1);

  // Custom food fields if user wants to log off-menu item
  const [isCustom, setIsCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customKcal, setCustomKcal] = useState('');
  const [customProt, setCustomProt] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');

  const searchResults = searchFoods(searchQuery);

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setIsCustom(false);
  };

  const handleAddPredefined = () => {
    if (!selectedFood) return;
    addMeal({
      foodId: selectedFood.id,
      name: selectedFood.name,
      category,
      calories: Math.round(selectedFood.calories * portion),
      protein: Math.round(selectedFood.protein * portion),
      carbs: Math.round(selectedFood.carbs * portion),
      fat: Math.round(selectedFood.fat * portion),
      portion,
      servingUnit: selectedFood.servingSize,
      image: selectedFood.image,
    });
    handleClose();
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    addMeal({
      name: customName.trim(),
      category,
      calories: parseInt(customKcal, 10) || 0,
      protein: parseInt(customProt, 10) || 0,
      carbs: parseInt(customCarbs, 10) || 0,
      fat: parseInt(customFat, 10) || 0,
      portion: 1,
      servingUnit: '1 serving',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    });
    handleClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedFood(null);
    setIsCustom(false);
    setPortion(1);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-forest-dark/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-ivory rounded-3xl shadow-lift border border-forest/15 overflow-hidden z-10 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-forest/10 flex items-center justify-between bg-ivory-light">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-forest text-lime flex items-center justify-center">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-forest">
                    Log Nourishment
                  </h3>
                  <p className="text-xs text-forest/60">
                    Search whole food library or enter custom meal macros
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full hover:bg-forest/10 flex items-center justify-center text-forest/70 hover:text-forest transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Category Pills */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-forest/60 mb-2 block">
                  Select Meal Window
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`py-2 text-xs font-semibold rounded-full capitalize transition-all ${
                        category === cat
                          ? 'bg-forest text-ivory shadow-subtle'
                          : 'bg-ivory-light border border-forest/10 text-forest/70 hover:border-forest/30'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mode switch: Predefined vs Custom */}
              <div className="flex items-center justify-between border-b border-forest/10 pb-3">
                <span className="text-xs font-semibold text-forest/70">
                  {isCustom ? 'Manual Macro Input' : 'Database Search'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsCustom(!isCustom)}
                  className="text-xs font-semibold text-forest underline hover:text-forest-light"
                >
                  {isCustom ? '← Back to whole foods search' : '+ Enter custom item manually'}
                </button>
              </div>

              {!isCustom ? (
                <>
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-forest/40 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search blueberries, kale, wild salmon, quinoa..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-ivory-light border border-forest/15 rounded-full text-sm text-forest placeholder:text-forest/40 focus:outline-none focus:ring-2 focus:ring-lime"
                    />
                  </div>

                  {/* Food List */}
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {searchResults.map((food) => {
                      const isSelected = selectedFood?.id === food.id;
                      return (
                        <div
                          key={food.id}
                          onClick={() => handleSelectFood(food)}
                          className={`p-3 rounded-2xl cursor-pointer border transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-lime/20 border-lime shadow-subtle'
                              : 'bg-ivory-light/60 border-forest/10 hover:border-forest/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {food.image && (
                              <img
                                src={food.image}
                                alt={food.name}
                                className="w-12 h-12 rounded-xl object-cover"
                              />
                            )}
                            <div>
                              <h4 className="text-sm font-semibold text-forest leading-snug">
                                {food.name}
                              </h4>
                              <p className="text-xs text-forest/60">
                                {food.servingSize} • P: {food.protein}g | C: {food.carbs}g | F: {food.fat}g
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-serif text-lg font-bold text-forest">
                              {food.calories}
                            </span>
                            <span className="text-xs text-forest/60 block">kcal</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Selected Food Confirmation & Portion Multiplier */}
                  {selectedFood && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl bg-forest/5 border border-forest/15 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-forest/60 uppercase tracking-wider block">
                            Selected Food
                          </span>
                          <span className="font-serif text-base font-bold text-forest">
                            {selectedFood.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-serif text-xl font-bold text-forest">
                            {Math.round(selectedFood.calories * portion)} kcal
                          </span>
                          <span className="text-xs text-forest/60 block">
                            P: {Math.round(selectedFood.protein * portion)}g | C: {Math.round(selectedFood.carbs * portion)}g | F: {Math.round(selectedFood.fat * portion)}g
                          </span>
                        </div>
                      </div>

                      {/* Portion buttons */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-forest/70 mr-2">
                          Portion:
                        </span>
                        {[0.5, 1, 1.5, 2].map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setPortion(p)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                              portion === p
                                ? 'bg-forest text-lime'
                                : 'bg-ivory border border-forest/15 text-forest/70 hover:border-forest/40'
                            }`}
                          >
                            {p}x
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </>
              ) : (
                /* Custom meal manual entry form */
                <form onSubmit={handleAddCustom} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-forest/60 mb-1 block">
                      Meal / Dish Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Heirloom Tomato & Burrata Toast"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-ivory-light border border-forest/15 rounded-xl text-sm text-forest focus:outline-none focus:ring-2 focus:ring-lime"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-forest/60 mb-1 block">
                        Calories (kcal) *
                      </label>
                      <input
                        type="number"
                        required
                        placeholder="450"
                        value={customKcal}
                        onChange={(e) => setCustomKcal(e.target.value)}
                        className="w-full px-3 py-2 bg-ivory-light border border-forest/15 rounded-xl text-sm text-forest focus:outline-none focus:ring-2 focus:ring-lime"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-forest/60 mb-1 block">
                        Protein (g)
                      </label>
                      <input
                        type="number"
                        placeholder="25"
                        value={customProt}
                        onChange={(e) => setCustomProt(e.target.value)}
                        className="w-full px-3 py-2 bg-ivory-light border border-forest/15 rounded-xl text-sm text-forest focus:outline-none focus:ring-2 focus:ring-lime"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-forest/60 mb-1 block">
                        Carbs (g)
                      </label>
                      <input
                        type="number"
                        placeholder="40"
                        value={customCarbs}
                        onChange={(e) => setCustomCarbs(e.target.value)}
                        className="w-full px-3 py-2 bg-ivory-light border border-forest/15 rounded-xl text-sm text-forest focus:outline-none focus:ring-2 focus:ring-lime"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-forest/60 mb-1 block">
                        Fats (g)
                      </label>
                      <input
                        type="number"
                        placeholder="15"
                        value={customFat}
                        onChange={(e) => setCustomFat(e.target.value)}
                        className="w-full px-3 py-2 bg-ivory-light border border-forest/15 rounded-xl text-sm text-forest focus:outline-none focus:ring-2 focus:ring-lime"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-lime text-forest font-semibold py-3 rounded-full hover:bg-lime-hover shadow-subtle transition-all mt-4"
                  >
                    Add Custom Meal
                  </button>
                </form>
              )}
            </div>

            {/* Footer Actions */}
            {!isCustom && (
              <div className="px-6 py-4 border-t border-forest/10 bg-ivory-light flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2 text-sm font-semibold text-forest/70 hover:text-forest"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedFood}
                  onClick={handleAddPredefined}
                  className={`px-8 py-2.5 rounded-full text-sm font-semibold transition-all ${
                    selectedFood
                      ? 'bg-lime text-forest hover:bg-lime-hover shadow-subtle'
                      : 'bg-forest/10 text-forest/30 cursor-not-allowed'
                  }`}
                >
                  Add to Daily Diary
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default QuickAddMealModal;
