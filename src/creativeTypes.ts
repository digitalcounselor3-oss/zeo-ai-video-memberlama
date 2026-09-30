import { UploadedImage } from './types';

export type CreativeCategory = 'Semua' | 'Story' | 'Creator' | 'Education' | 'Animation' | 'Visual';

export interface CreativeVideoTypeMeta {
  id: string;
  title: string;
  desc: string;
  category: 'Story' | 'Creator' | 'Education' | 'Animation' | 'Visual';
  iconType: string;
  defaultPlaceholder: string;
  badge: string;
  color: string;
}

export type CreativeCharacterChoice =
  | 'Karakter dari Referensi'
  | 'Upload Character Sheet'
  | 'Karakter dari Teks'
  | 'Tanpa Karakter';

export type CreativeDuration = '8 detik' | '10 detik' | '15 detik' | '30 detik' | 'Custom';

export type CreativeSceneCount = '1 Scene' | '2 Scene' | '3 Scene' | '5 Scene' | 'Otomatis';

export type CreativeStyle =
  | 'Otomatis'
  | 'Realistic'
  | 'Semi Realistic'
  | '3D Animation'
  | 'Cinematic'
  | 'Cute Cartoon'
  | 'Anime'
  | 'Miniature'
  | 'Paper Art'
  | 'Documentary';

export type CreativeAudio =
  | 'Tanpa Dialog'
  | 'Voice Over'
  | 'Dialog Karakter'
  | 'VO + Dialog'
  | 'ASMR / SFX'
  | 'Otomatis';

export type CreativePlatform =
  | 'TikTok / Reels / Shorts'
  | 'Landscape Video'
  | 'Semua Platform';

export type CreativeCharacterType =
  | 'Manusia'
  | 'Hewan'
  | 'Benda / Objek'
  | 'Karakter Fantasi'
  | 'Robot'
  | 'Otomatis';

export type CreativeTimeTransition =
  | 'Portal'
  | 'Match Cut'
  | 'Morphing'
  | 'Flash of Light'
  | 'Photo Transition'
  | 'Memory Fade'
  | 'Cinematic Transition'
  | 'Otomatis';

export type TinyWorldScale = 'Micro' | 'Miniature' | 'Toy Scale' | 'Otomatis';
export type AsmrSubject = 'Tangan Saja' | 'Dengan Karakter' | 'Tanpa Manusia' | 'Otomatis';
export type FoodStageOption =
  | 'Dari Bahan Awal sampai Penyajian'
  | 'Preparation Only'
  | 'Cooking Only'
  | 'Plating Only'
  | 'Otomatis';
export type FoodPersonMode = 'Tangan Saja' | 'Chef / Model' | 'Tanpa Orang' | 'Otomatis';

export type TeacherPresentationMode =
  | 'Hologram'
  | 'Realistis Studio'
  | 'Virtual Studio'
  | 'Whiteboard'
  | 'Apple Event'
  | 'Iron Man JARVIS'
  | 'Corporate Futuristic'
  | 'Sci-Fi Lab'
  | 'Medical Laboratory'
  | 'NASA Command Center'
  | 'Classroom Modern'
  | 'Cartoon 3D'
  | 'Pixar Style'
  | 'Disney Style'
  | 'Mixed Reality (AR)';

export interface CreativeFormState {
  references: UploadedImage[];
  characterChoice: CreativeCharacterChoice;
  characterTypeChoice?: CreativeCharacterType;
  characterSheetImage: UploadedImage | null;
  characterDescription: string;
  characterLock: boolean;
  videoIdea: string;
  timelineEra?: string;
  timeTransition?: CreativeTimeTransition;
  // Teacher & Presenter specific inputs:
  presentationMode?: TeacherPresentationMode;
  targetUser?: string;
  videoGoal?: string;
  topicContent?: string;
  targetAudience?: string;
  presenterName?: string;
  optionalBrief?: string;
  // Process & Transformation Engine inputs:
  timelapseStartCondition?: string;
  timelapseEndResult?: string;
  tinyWorldConcept?: string;
  tinyWorldScale?: TinyWorldScale;
  asmrSubject?: AsmrSubject;
  foodDishName?: string;
  foodStageOption?: FoodStageOption;
  foodPersonMode?: FoodPersonMode;
  duration: CreativeDuration;
  customDurationSeconds: number;
  sceneCount: CreativeSceneCount;
  visualStyle: CreativeStyle;
  audio: CreativeAudio;
  platform: CreativePlatform;
}

export interface CharacterVisualIdentity {
  genderPresentation?: string;
  ageGroup?: string;
  facialAppearance?: string;
  facialStructure?: string;
  skinAppearance?: string;
  hairstyleOrHijab?: string;
  bodyProportions?: string;
  outfitAndColor?: string;
  footwear?: string;
  accessories?: string;
  visualStyle?: string;
}

export interface MasterCharacterItem {
  id: string;
  name: string;
  sumberKarakter: 'Referensi Pengguna' | 'Deskripsi Teks' | 'Tanpa Karakter';
  visualIdentity: CharacterVisualIdentity;
  characterSheetPrompt: string;
}

export interface LocationEnvironmentDetails {
  locationType: string;
  timeOfDayOrEra: string;
  architecture: string;
  furnitureAndLayout: string;
  importantElements: string;
  lightingAndAtmosphere: string;
  visualStyle: string;
}

export interface MasterLocationItem {
  id: string;
  name: string;
  environmentDetails: LocationEnvironmentDetails;
  locationLockPrompt: string;
}

export interface MasterPropItem {
  id: string;
  name: string;
  significance: string;
  propPrompt: string;
}

export interface CreativeStoryboardScene {
  sceneNumber: number;
  durationLabel: string;
  visual: string;
  action: string;
  camera: string;
  transition: string;
  characterInvolved?: string;
  locationUsed?: string;
}

export interface SceneImagePromptItem {
  sceneNumber: number;
  title: string;
  prompt: string;
  aspectRatio: string;
}

export interface SceneVideoPromptItem {
  sceneNumber: number;
  title: string;
  prompt: string;
}

export interface DialogVoiceOverData {
  type: string;
  script?: string | null;
  voiceOver?: string | null;
  dialogue?: Array<{ speaker: string; text: string }>;
  timingNotes?: string;
}

export interface SfxAmbienceData {
  ambientSounds: string[];
  soundEffects: string[];
  musicMood: string;
}

export interface KeyFramePromptItem {
  title: string;
  type: 'first-frame' | 'last-frame';
  prompt: string;
  description?: string;
  aspectRatio: string;
}

export interface TransformationStageItem {
  stageNumber: number;
  title: string;
  description: string;
  cameraTreatment?: string;
}

export interface ObjectIngredientReferenceItem {
  id: string;
  name: string;
  category: 'Bahan / Ingredient' | 'Objek / Benda' | 'Peralatan / Tool' | 'Properti';
  prompt: string;
  details?: string;
}

export interface CreativeStoryAnalysis {
  premis: string;
  tema: string;
  alurRingkas: string;
  emosiSuasana: string;
  emotionalArc?: string;
  timeTransitionUsed?: string;
  characterTypeIdentified?: string;
  isProcessEngine?: boolean;
  processEngineType?: 'timelapse' | 'tiny-world' | 'asmr' | 'food';
  characterNotRequired?: boolean;
  processHeadline?: string;
  gayaVisualTerkunci: string;
}

export type FoodActivityId =
  | 'grocery-unpacking'
  | 'sorting'
  | 'washing'
  | 'peeling-cutting'
  | 'food-preparation'
  | 'portioning'
  | 'storage-restock'
  | 'full-preparation';

export interface FoodDetectedIngredient {
  id: string;
  name: string;
  selected: boolean;
  isCustom?: boolean;
}

export interface IngredientStateMapItem {
  ingredient: string;
  statesPerScene: Array<{
    sceneNumber: number;
    state: string;
  }>;
}

export interface FoodProcessBoardScene {
  sceneNumber: number;
  activity: string;
  ingredient: string;
  startState: string;
  action: string;
  endState: string;
  camera: string;
  handAction: string;
  asmrSfx: string;
  continuity: string;
}

export interface FoodPrepResult {
  photoAnalysis: string;
  detectedIngredients: string[];
  selectedActivities: string[];
  conceptSummary: string;
  ingredientStateMap: IngredientStateMapItem[];
  processBoard: FoodProcessBoardScene[];
  imagePrompts: Array<{
    title: string;
    aspectRatio: string;
    prompt: string;
    notes?: string;
  }>;
  videoPrompts: Array<{
    sceneNumber: number;
    title: string;
    prompt: string;
  }>;
  asmrPlan: Array<{
    activity: string;
    sfxSounds: string[];
    ambientText: string;
  }>;
  finalShot: {
    title: string;
    description: string;
    prompt: string;
  };
  negativePrompt: string;
  modelUsed?: string;
  waktuAnalisis?: string;
}

export interface CreativeAnalysisResult {
  analisisCerita: CreativeStoryAnalysis;
  transformationPlan?: TransformationStageItem[];
  masterCharacters: MasterCharacterItem[];
  masterLocations: MasterLocationItem[];
  masterProps?: MasterPropItem[];
  objectReferences?: ObjectIngredientReferenceItem[];
  firstFramePrompt?: KeyFramePromptItem;
  storyboard: CreativeStoryboardScene[];
  sceneImagePrompts: SceneImagePromptItem[];
  lastFramePrompt?: KeyFramePromptItem;
  sceneVideoPrompts: SceneVideoPromptItem[];
  dialogVoiceOver: DialogVoiceOverData;
  sfxAndAmbience: SfxAmbienceData;
  negativePrompt: string;
  foodPrepData?: FoodPrepResult;
  musicLyricData?: MusicLyricResult;
  modelUsed?: string;
  waktuAnalisis?: string;
}

export type ZeoAutoDurationScope = 'Setiap Scene' | 'Total Video';

export type ZeoAutoSceneCount = '1' | '2' | '3' | '4' | '5' | 'Otomatis';

export type ZeoAutoImageClassification =
  | 'CHARACTER_REFERENCE'
  | 'CHARACTER_SHEET'
  | 'LOCATION_REFERENCE'
  | 'OUTFIT_REFERENCE'
  | 'OBJECT_REFERENCE'
  | 'FOOD_REFERENCE'
  | 'BUILDING_REFERENCE'
  | 'STYLE_REFERENCE'
  | 'OTHER_REFERENCE';

export interface ZeoAutoImageAnalysisItem {
  id: string;
  name: string;
  classification: ZeoAutoImageClassification;
  functionDescription: string;
}

export interface ZeoAutoDetectionInfo {
  primaryEngineId: string;
  primaryEngineTitle: string;
  secondaryEngineTitle?: string;
  flowType: 'STORY FLOW' | 'PROCESS FLOW';
  conceptExplanation: string;
  hasCharacter: boolean;
  hasLocation: boolean;
  hasImportantProp: boolean;
  imageClassifications: ZeoAutoImageAnalysisItem[];
}

export interface ZeoAutoStoryboardItem {
  sceneNumber: number;
  duration: string;
  location?: string;
  character?: string;
  visual: string;
  action: string;
  expression?: string;
  camera: string;
  dialogueOrVo?: string;
  sfx?: string;
  transition: string;
}

export interface ZeoAutoResult {
  detection: ZeoAutoDetectionInfo;
  analisisIde: {
    summary: string;
    coreTheme: string;
    visualPlan: string;
  };
  masterCharacters: MasterCharacterItem[];
  masterLocations: MasterLocationItem[];
  masterProps?: MasterPropItem[];
  storyboard: ZeoAutoStoryboardItem[];
  transformationPlan?: TransformationStageItem[];
  sceneImagePrompts: SceneImagePromptItem[];
  firstFramePrompt?: KeyFramePromptItem;
  lastFramePrompt?: KeyFramePromptItem;
  sceneVideoPrompts: SceneVideoPromptItem[];
  dialogVoiceOver: DialogVoiceOverData;
  sfxAndAmbience: SfxAmbienceData;
  negativePrompt: string;
  modelUsed?: string;
  waktuAnalisis?: string;
  isAlternative?: boolean;
}

export interface ZeoAutoFormState {
  references: UploadedImage[];
  videoIdea: string;
  duration: CreativeDuration;
  customDurationSeconds: number;
  durationScope: ZeoAutoDurationScope;
  sceneCount: ZeoAutoSceneCount;
  visualStyle: CreativeStyle;
  audio: CreativeAudio;
  platform: CreativePlatform;
}

export type MusicLyricSourceType =
  | 'lagu' // 🎧 SAYA SUDAH PUNYA LAGU
  | 'lirik' // 📝 SAYA SUDAH PUNYA LIRIK
  | 'buat-lirik' // ✨ BUATKAN LIRIK BARU
  | 'instrumental'; // 🎼 INSTRUMENTAL / TANPA LIRIK

export type MusicLyricVideoType =
  | 'Animated Music Video'
  | 'Cinematic Music Video'
  | 'Lyric Video'
  | 'Story Music Video'
  | 'Character Singing'
  | 'Music Visualizer'
  | 'Dream / Surreal MV'
  | 'Children Music Video';

export type MusicLyricProductionMode = 'SUPER HEMAT' | 'HEMAT' | 'NORMAL' | 'PREMIUM';

export interface MusicLyricAnalysis {
  sourceType: MusicLyricSourceType;
  theme: string;
  mood: string;
  genre: string;
  story: string;
  emotionalProgression: string;
  symbolsAndMetaphors: string[];
  charactersIdentified: string[];
  locationsIdentified: string[];
  songLyrics: string;
}

export interface SongStructureItem {
  section: string;
  title: string;
  timingOrCue: string;
  description: string;
}

export interface MusicStoryboardScene {
  sceneNumber: number;
  songSection: string;
  lyricCue: string;
  duration: string;
  location: string;
  character: string;
  visualIdea: string;
  emotion: string;
  action: string;
  camera: string;
  transition: string;
  textLyricDisplay: string;
  continuity: string;
}

export interface MusicTransitionItem {
  fromScene: number;
  toScene: number;
  transitionType: string;
  motionDescription: string;
}

export interface LyricOverlayItem {
  sceneNumber: number;
  timestampCue: string;
  text: string;
  position: string;
  animation: string;
  entry: string;
  exit: string;
  fontMood: string;
}

export interface MusicLyricResult {
  musicLyricAnalysis: MusicLyricAnalysis;
  conceptSummary: string;
  masterVisualStyle: string;
  masterCharacters: MasterCharacterItem[];
  masterLocations: MasterLocationItem[];
  songStructure: SongStructureItem[];
  storyboard: MusicStoryboardScene[];
  sceneImagePrompts: Array<{
    sceneNumber: number;
    title: string;
    aspectRatio: string;
    prompt: string;
  }>;
  sceneVideoPrompts: Array<{
    sceneNumber: number;
    title: string;
    prompt: string;
    singerLockNotes?: string;
  }>;
  transitionPlan: MusicTransitionItem[];
  lyricOverlayPlan: LyricOverlayItem[];
  audioSfxNotes: {
    musicStyle: string;
    sfxLayers: string[];
    vocalNotes?: string;
  };
  finalShot: {
    title: string;
    prompt: string;
    description: string;
  };
  negativePrompt: string;
  modelUsed?: string;
  waktuAnalisis?: string;
}


