import React from 'react';
import {
  TerminalSquare,
  BookOpen,
  HardDrive,
  Sparkles,
  FileText,
  Table,
  Presentation,
  Cpu,
  MessageSquare,
  Music,
  Mail,
  Calendar,
  Video,
  Headphones,
  CheckSquare,
  Hash,
  Code2,
  GitBranch,
  Cloud,
  Layers,
  CheckCircle2,
  Compass,
  FolderKanban,
  ExternalLink,
  Zap,
  Globe,
} from 'lucide-react';

interface AppIconProps {
  name: string;
  className?: string;
  color?: string;
}

export const AppIcon: React.FC<AppIconProps> = ({ name, className = 'w-5 h-5', color }) => {
  const iconProps = {
    className,
    style: color ? { color } : undefined,
  };

  switch (name) {
    case 'TerminalSquare':
      return <TerminalSquare {...iconProps} />;
    case 'BookOpen':
      return <BookOpen {...iconProps} />;
    case 'HardDrive':
      return <HardDrive {...iconProps} />;
    case 'Sparkles':
      return <Sparkles {...iconProps} />;
    case 'FileText':
      return <FileText {...iconProps} />;
    case 'Table':
      return <Table {...iconProps} />;
    case 'Presentation':
      return <Presentation {...iconProps} />;
    case 'Cpu':
      return <Cpu {...iconProps} />;
    case 'MessageSquare':
      return <MessageSquare {...iconProps} />;
    case 'Music':
      return <Music {...iconProps} />;
    case 'Mail':
      return <Mail {...iconProps} />;
    case 'Calendar':
      return <Calendar {...iconProps} />;
    case 'Video':
      return <Video {...iconProps} />;
    case 'Headphones':
      return <Headphones {...iconProps} />;
    case 'CheckSquare':
      return <CheckSquare {...iconProps} />;
    case 'Hash':
      return <Hash {...iconProps} />;
    case 'Code2':
      return <Code2 {...iconProps} />;
    case 'GitBranch':
      return <GitBranch {...iconProps} />;
    case 'Cloud':
      return <Cloud {...iconProps} />;
    case 'Layers':
      return <Layers {...iconProps} />;
    case 'CheckCircle2':
      return <CheckCircle2 {...iconProps} />;
    case 'Compass':
      return <Compass {...iconProps} />;
    case 'FolderKanban':
      return <FolderKanban {...iconProps} />;
    case 'Zap':
      return <Zap {...iconProps} />;
    default:
      return <Globe {...iconProps} />;
  }
};
