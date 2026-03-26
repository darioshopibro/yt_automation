// Script to generate phosphor-icons.json from the @phosphor-icons/react package
// Run: npx tsx server/generate-icons.ts

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read exports from the package
const pkgPath = path.join(__dirname, '..', 'node_modules', '@phosphor-icons', 'react', 'dist', 'csr', 'index.mjs');

// Alternative: read the source index to extract icon names
const srcPath = path.join(__dirname, '..', 'node_modules', '@phosphor-icons', 'react', 'dist', 'csr');

let iconNames: string[] = [];

// Try to read from the package's index
try {
  // Read the barrel export file
  const possiblePaths = [
    path.join(__dirname, '..', 'node_modules', '@phosphor-icons', 'react', 'dist', 'csr', 'index.mjs'),
    path.join(__dirname, '..', 'node_modules', '@phosphor-icons', 'react', 'dist', 'csr', 'index.js'),
    path.join(__dirname, '..', 'node_modules', '@phosphor-icons', 'react', 'dist', 'index.mjs'),
    path.join(__dirname, '..', 'node_modules', '@phosphor-icons', 'react', 'dist', 'index.js'),
  ];

  let content = '';
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      content = fs.readFileSync(p, 'utf-8');
      console.log(`Reading from: ${p}`);
      break;
    }
  }

  if (!content) {
    // Fallback: scan the directory for icon files
    const distDir = path.join(__dirname, '..', 'node_modules', '@phosphor-icons', 'react', 'dist');
    console.log('Scanning dist directory...');

    // Look for .mjs or .js files that look like icon components
    function scanDir(dir: string) {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          scanDir(path.join(dir, entry.name));
        } else if (entry.name.match(/^[A-Z].*\.(mjs|js)$/) && !entry.name.includes('index')) {
          const name = entry.name.replace(/\.(mjs|js)$/, '');
          if (!name.includes('.') && !name.includes('SSR') && name !== 'IconBase' && name !== 'IconContext') {
            iconNames.push(name);
          }
        }
      }
    }
    scanDir(distDir);
  } else {
    // Parse export statements: export { default as IconName } from './IconName.mjs'
    const exportRegex = /export\s*\{\s*(?:default\s+as\s+)?(\w+)\s*\}/g;
    let match;
    while ((match = exportRegex.exec(content)) !== null) {
      const name = match[1];
      if (name !== 'IconContext' && name !== 'IconBase' && !name.includes('SSR')) {
        iconNames.push(name);
      }
    }

    // Also try: export { IconName } pattern
    if (iconNames.length === 0) {
      const simpleExport = /export\s+\{\s*([^}]+)\}/g;
      while ((match = simpleExport.exec(content)) !== null) {
        const names = match[1].split(',').map(s => s.trim().split(/\s+as\s+/).pop()!.trim());
        for (const name of names) {
          if (name && name !== 'IconContext' && name !== 'IconBase' && !name.includes('SSR')) {
            iconNames.push(name);
          }
        }
      }
    }
  }
} catch (err) {
  console.error('Error reading package:', err);
}

// Deduplicate and sort
iconNames = [...new Set(iconNames)].sort();

console.log(`Found ${iconNames.length} icons`);

// Write the list
const outPath = path.join(__dirname, 'phosphor-icons.json');
fs.writeFileSync(outPath, JSON.stringify(iconNames, null, 2));
console.log(`Written to: ${outPath}`);

// If we got 0 icons, write a fallback with common icons
if (iconNames.length === 0) {
  console.log('No icons found from package, writing common icons fallback...');
  const commonIcons = [
    "Acorn", "Activity", "AddressBook", "Airplane", "Alarm", "Alien", "AlignBottom",
    "Anchor", "AndroidLogo", "Aperture", "AppleLogo", "Archive", "ArrowBendDownLeft",
    "ArrowCircleDown", "ArrowCircleLeft", "ArrowCircleRight", "ArrowCircleUp",
    "ArrowClockwise", "ArrowCounterClockwise", "ArrowDown", "ArrowElbowDownLeft",
    "ArrowFatDown", "ArrowLeft", "ArrowLineDown", "ArrowRight", "ArrowSquareDown",
    "ArrowUp", "ArrowsClockwise", "ArrowsCounterClockwise", "ArrowsDownUp",
    "ArrowsHorizontal", "ArrowsIn", "ArrowsLeftRight", "ArrowsMerge", "ArrowsOut",
    "ArrowsSplit", "ArrowsVertical", "Article", "At", "Atom",
    "Baby", "Backspace", "Bag", "BagSimple", "Bank", "Barbell", "Barricade",
    "Baseball", "Basket", "Basketball", "Bathtub", "Battery", "BatteryCharging",
    "Bed", "BeerBottle", "Bell", "BellRinging", "BellSimple", "Bicycle",
    "Binoculars", "Bird", "Bluetooth", "Boat", "Bone", "Book", "BookBookmark",
    "BookOpen", "Bookmark", "BookmarkSimple", "Books", "BoundingBox", "Brain",
    "Brandy", "Bridge", "Briefcase", "Broadcast", "Browser", "Browsers",
    "Bug", "BugBeetle", "Buildings", "Bus", "Butterfly",
    "Cactus", "Cake", "Calculator", "Calendar", "CalendarBlank", "Camera",
    "CameraRotate", "Car", "Cards", "CaretCircleDown", "CaretCircleLeft",
    "CaretCircleRight", "CaretCircleUp", "CaretDoubleDown", "CaretDoubleLeft",
    "CaretDoubleRight", "CaretDoubleUp", "CaretDown", "CaretLeft", "CaretRight",
    "CaretUp", "Cat", "CellSignalFull", "Certificate", "ChalkboardTeacher",
    "ChartBar", "ChartLine", "ChartPie", "Chat", "ChatCircle", "ChatDots",
    "ChatTeardrop", "Check", "CheckCircle", "CheckFat", "CheckSquare", "Checks",
    "Circle", "CircleDashed", "CircleHalf", "CircleNotch", "City",
    "Clipboard", "ClipboardText", "Clock", "ClockAfternoon", "ClockClockwise",
    "ClockCountdown", "ClockCounterClockwise", "ClosedCaptioning", "Cloud",
    "CloudArrowDown", "CloudArrowUp", "CloudCheck", "CloudSlash", "CloudSun",
    "Club", "CoatHanger", "Code", "CodeBlock", "CodeSimple", "Coffee",
    "Coin", "Coins", "Columns", "Command", "Compass", "ComputerTower",
    "Confetti", "Cookie", "Copy", "CopySimple", "Copyright", "Corners",
    "Couch", "Cpu", "CreditCard", "Crop", "Cross", "Crosshair", "Crown",
    "Cube", "CurrencyCircleDollar", "CurrencyDollar", "Cursor", "CursorClick",
    "CursorText", "Cylinder",
    "Database", "Desktop", "DesktopTower", "Detective", "DeviceMobile",
    "DeviceTablet", "Diamond", "Disc", "Discord", "Dog", "Door",
    "DotsThree", "DotsThreeCircle", "DotsThreeVertical", "Download",
    "DownloadSimple", "DribbbleLogo", "Drop", "DropHalf", "Ear", "EarSlash",
    "Egg", "Eject", "Elevator", "Envelope", "EnvelopeOpen", "EnvelopeSimple",
    "Equalizer", "Eraser", "Exam", "Export", "Eye", "EyeClosed", "EyeSlash",
    "Eyedropper", "EyeglassesSimple",
    "FaceMask", "FacebookLogo", "Factory", "Faders", "FadersHorizontal",
    "Fan", "FastForward", "Feather", "File", "FileArchive", "FileArrowDown",
    "FileArrowUp", "FileAudio", "FileCloud", "FileCode", "FileCsv", "FileDoc",
    "FileDotted", "FileHtml", "FileImage", "FileJpg", "FileJs", "FileLock",
    "FileMinus", "FilePdf", "FilePlus", "FilePng", "FileRs", "FileSearch",
    "FileSql", "FileSvg", "FileText", "FileTs", "FileTsx", "FileVideo",
    "FileX", "FileZip", "Files", "FilmReel", "FilmStrip", "Fingerprint",
    "Fire", "FireSimple", "FirstAid", "FirstAidKit", "Fish", "Flag",
    "FlagBanner", "FlashLight", "Flask", "FloppyDisk", "FloppyDiskBack",
    "FlowArrow", "Flower", "FlyingSaucer", "Folder", "FolderDotted",
    "FolderLock", "FolderMinus", "FolderNotch", "FolderOpen", "FolderPlus",
    "FolderSimple", "FolderStar", "FolderUser", "Football", "Footprints",
    "ForkKnife", "FrameCorners", "Function", "Funnel", "FunnelSimple",
    "GameController", "Garage", "GasPump", "Gauge", "Gear", "GearFine",
    "GearSix", "GenderFemale", "GenderIntersex", "GenderMale", "Ghost",
    "Gif", "Gift", "GitBranch", "GitCommit", "GitDiff", "GitFork",
    "GitMerge", "GitPullRequest", "GithubLogo", "GitlabLogo", "Globe",
    "GlobeHemisphereEast", "GlobeHemisphereWest", "GlobeSimple",
    "GoogleChromeLogo", "GoogleLogo", "GooglePlayLogo", "Gradient",
    "GraduationCap", "Graph", "GridFour", "Guitar", "Hamburger", "Hammer",
    "Hand", "HandFist", "HandGrabbing", "HandHeart", "HandPalm",
    "HandPointing", "HandWaving", "Handbag", "HandsClapping", "Handshake",
    "HardDrive", "HardDrives", "Hash", "HashStraight", "Headphones",
    "Headset", "Heart", "HeartBreak", "HeartStraight", "Heartbeat",
    "Hexagon", "HighHeel", "Hoodie", "Horse", "Hourglass",
    "HourglassHigh", "HourglassMedium", "HourglassSimple", "House",
    "HouseLine", "HouseSimple", "IdentificationBadge", "IdentificationCard",
    "Image", "ImageSquare", "Infinity", "Info", "InstagramLogo",
    "Intersect", "Jar", "JarLabel", "Joystick", "Key", "Keyboard",
    "Keyhole", "Knife", "Ladder", "LadderSimple", "Lamp", "Laptop",
    "Layout", "Leaf", "Lightbulb", "LightbulbFilament", "Lightning",
    "LightningSlash", "LineSegment", "Link", "LinkBreak", "LinkSimple",
    "LinkedinLogo", "LinuxLogo", "List", "ListBullets", "ListChecks",
    "ListDashes", "ListMagnifyingGlass", "ListNumbers", "ListPlus", "Lock",
    "LockKey", "LockKeyOpen", "LockOpen", "LockSimple", "LockSimpleOpen",
    "MagicWand", "Magnet", "MagnifyingGlass", "MagnifyingGlassMinus",
    "MagnifyingGlassPlus", "MapPin", "MapPinLine", "MapTrifold",
    "MarkerCircle", "Martini", "MaskHappy", "MaskSad", "Medal",
    "MedalMilitary", "MediumLogo", "Megaphone", "MegaphoneSimple",
    "Microphone", "MicrophoneSlash", "MicrosoftExcelLogo",
    "MicrosoftOutlookLogo", "MicrosoftPowerpointLogo", "MicrosoftWordLogo",
    "Minus", "MinusCircle", "MinusSquare", "Money", "Monitor",
    "MonitorPlay", "Moon", "MoonStars", "Mountains", "Mouse",
    "MusicNote", "MusicNotes", "NavigationArrow", "Needle", "Newspaper",
    "Note", "NoteBlank", "NoteButton", "Notebook", "NotePencil", "Notification",
    "NumberCircleEight", "NumberCircleFive", "NumberCircleFour",
    "NumberCircleNine", "NumberCircleOne", "NumberCircleSeven",
    "NumberCircleSix", "NumberCircleThree", "NumberCircleTwo",
    "NumberCircleZero", "NumberEight", "NumberFive", "NumberFour",
    "NumberNine", "NumberOne", "NumberSeven", "NumberSix", "NumberSquareEight",
    "NumberSquareFive", "NumberSquareFour", "NumberSquareNine",
    "NumberSquareOne", "NumberSquareSeven", "NumberSquareSix",
    "NumberSquareThree", "NumberSquareTwo", "NumberSquareZero",
    "NumberThree", "NumberTwo", "NumberZero", "Nut",
    "Octagon", "Option", "Package", "PaintBrush", "PaintBucket", "PaintRoller",
    "Palette", "Pants", "Paperclip", "PaperPlane", "PaperPlaneTilt",
    "Paragraph", "Parallelogram", "Park", "Password", "Path", "Pause",
    "PauseCircle", "PawPrint", "Peace", "Pen", "PenNib", "PenNibStraight",
    "Pencil", "PencilCircle", "PencilLine", "PencilSimple", "Pentagon",
    "Pepper", "Percent", "Person", "PersonArmsSpread", "PersonSimple",
    "PersonSimpleRun", "PersonSimpleWalk", "Perspective", "Phone",
    "PhoneCall", "PhoneDisconnect", "PhoneIncoming", "PhoneOutgoing",
    "PhonePlus", "PhoneSlash", "PhosphorLogo", "Pi", "PianoKeys",
    "PictureInPicture", "PiggyBank", "Pill", "Pin", "Pinwheel",
    "Pizza", "Placeholder", "Planet", "Plant", "Play", "PlayCircle",
    "Playlist", "Plug", "PlugCharging", "Plugs", "PlugsConnected", "Plus",
    "PlusCircle", "PlusMinus", "PlusSquare", "PokerChip", "Police",
    "Polygon", "Popcorn", "Power", "Prescription", "Presentation",
    "PresentationChart", "Printer", "Prohibit", "ProhibitInset",
    "ProjectorScreen", "ProjectorScreenChart", "Pulse", "PushPin",
    "PushPinSimple", "PuzzlePiece", "QrCode", "Question", "Queue",
    "Quotes", "Radical", "Radio", "RadioButton", "Rainbow", "Receipt",
    "Record", "Rectangle", "Recycle", "RedditLogo", "Repeat",
    "RepeatOnce", "Rewind", "Rocket", "RocketLaunch", "Robot", "Rows",
    "Rss", "RssSimple", "Rug", "Ruler", "Scales", "Scan", "Scissors",
    "Screencast", "ScribbleLoop", "Scroll", "Seal", "SealCheck",
    "SealWarning", "Selection", "SelectionAll", "SelectionBackground",
    "SelectionForeground", "SelectionInverse", "SelectionPlus",
    "SelectionSlash", "ShareFat", "ShareNetwork", "Shield", "ShieldCheck",
    "ShieldCheckered", "ShieldChevron", "ShieldPlus", "ShieldSlash",
    "ShieldStar", "ShieldWarning", "ShirtFolded", "ShoppingBag",
    "ShoppingBagOpen", "ShoppingCart", "ShoppingCartSimple", "Shower",
    "Shrimp", "Shuffle", "ShuffleAngular", "ShuffleSimple", "Sidebar",
    "SidebarSimple", "Sigma", "SignIn", "SignOut", "Signature",
    "SimCard", "Siren", "SketchLogo", "SkipBack", "SkipBackCircle",
    "SkipForward", "SkipForwardCircle", "Skull", "SlackLogo", "Sliders",
    "SlidersHorizontal", "Smiley", "SmileyBlank", "SmileyMeh",
    "SmileyNervous", "SmileySad", "SmileySticker", "SmileyWink",
    "SmileyXEyes", "SnapchatLogo", "Snowflake", "SoccerBall",
    "SortAscending", "SortDescending", "Spade", "Sparkle", "SpeakerHigh",
    "SpeakerLow", "SpeakerNone", "SpeakerSimpleHigh", "SpeakerSimpleLow",
    "SpeakerSimpleNone", "SpeakerSimpleSlash", "SpeakerSimpleX",
    "SpeakerSlash", "SpeakerX", "Spinner", "SpinnerGap", "Spiral",
    "SpotifyLogo", "Square", "SquareHalf", "SquareLogo",
    "SquareSplitHorizontal", "SquareSplitVertical", "Stack", "StackOverflowLogo",
    "StackSimple", "Stairs", "Stamp", "Star", "StarAndCrescent", "StarFour",
    "StarHalf", "StarOfDavid", "Stethoscope", "Sticker", "Stop",
    "StopCircle", "Storefront", "Strategy", "Stripe", "Student",
    "Subtract", "SubtractSquare", "Suitcase", "SuitcaseRolling",
    "SuitcaseSimple", "Sun", "SunDim", "SunHorizon", "Sunglasses",
    "Swap", "Swatches", "SwimmingPool", "Sword", "Synagogue",
    "Syringe",
    "TShirt", "Table", "Tabs", "Tag", "TagChevron", "TagSimple", "Target",
    "Taxi", "Telegram", "Television", "TelegramLogo",
    "Terminal", "TerminalWindow", "TestTube", "TextAa", "TextAlignCenter",
    "TextAlignJustify", "TextAlignLeft", "TextAlignRight", "TextB",
    "TextH", "TextHFive", "TextHFour", "TextHOne", "TextHSix",
    "TextHThree", "TextHTwo", "TextIndent", "TextItalic", "TextOutdent",
    "TextStrikethrough", "TextT", "TextUnderline", "Textbox",
    "Thermometer", "ThermometerCold", "ThermometerHot", "ThermometerSimple",
    "ThumbsDown", "ThumbsUp", "Ticket", "TiktokLogo", "Timer",
    "Tipi", "ToggleLeft", "ToggleRight", "Toilet", "ToiletPaper",
    "Toolbox", "Tote", "ToteSimple", "TrademarkRegistered", "TrafficCone",
    "TrafficSign", "TrafficSignal", "Train", "TrainRegional",
    "TrainSimple", "Tram", "Translate", "Trash", "TrashSimple", "Tree",
    "TreeEvergreen", "TreePalm", "TreeStructure", "TrendDown", "TrendUp",
    "Triangle", "Trophy", "Truck", "TwitchLogo", "TwitterLogo",
    "Umbrella", "UmbrellaSimple", "Unite", "Upload", "UploadSimple",
    "Usb", "User", "UserCircle", "UserFocus", "UserGear", "UserList",
    "UserMinus", "UserPlus", "UserRectangle", "UserSquare", "UserSwitch",
    "Users", "UsersFour", "UsersThree", "Vault", "Vibrate", "Video",
    "VideoCamera", "Vignette", "VirtualReality", "Virus", "Voicemail",
    "Volleyball", "Wall", "Wallet", "Warehouse", "Warning",
    "WarningCircle", "WarningDiamond", "WarningOctagon", "Watch",
    "WaveSawtooth", "WaveSine", "WaveSquare", "WaveTriangle", "Waves",
    "Webcam", "WebhooksLogo", "WhatsappLogo", "Wheelchair", "WifiHigh",
    "WifiLow", "WifiMedium", "WifiNone", "WifiSlash", "WifiX", "Wind",
    "WindowsLogo", "Wine", "Wrench", "X", "XCircle", "XSquare",
    "YinYang", "YoutubeLogo"
  ];
  fs.writeFileSync(outPath, JSON.stringify(commonIcons, null, 2));
  console.log(`Written ${commonIcons.length} common icons as fallback`);
}
