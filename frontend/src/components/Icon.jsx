import React from 'react';

/**
 * Material Symbols wrapper. Exposes the same named exports the app previously
 * imported from lucide-react, so every component picks up the new icon set
 * (matching the EligiPath design) without changing call sites.
 */
function make(glyph) {
  const Comp = ({ size = 20, color, className = '', style = {}, filled = false, ...rest }) => (
    <span
      className={`material-symbols-outlined select-none leading-none ${className}`}
      style={{
        fontSize: size,
        color,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}`,
        verticalAlign: 'middle',
        ...style,
      }}
      aria-hidden="true"
      {...rest}
    >
      {glyph}
    </span>
  );
  Comp.displayName = `Icon(${glyph})`;
  return Comp;
}

export const Icon = ({ name, ...props }) => make(name)(props);

export const AlertCircle = make('error');
export const AlertTriangle = make('warning');
export const ArrowRight = make('arrow_forward');
export const Award = make('workspace_premium');
export const Bell = make('notifications');
export const BookOpen = make('menu_book');
export const Bookmark = make('bookmark');
export const Briefcase = make('work');
export const Building2 = make('account_balance');
export const Calendar = make('calendar_month');
export const CheckCircle2 = make('check_circle');
export const ChevronRight = make('chevron_right');
export const Clock = make('schedule');
export const Compass = make('explore');
export const Cpu = make('memory');
export const Download = make('download');
export const ExternalLink = make('open_in_new');
export const FileText = make('description');
export const Filter = make('filter_list');
export const Globe = make('public');
export const GraduationCap = make('school');
export const Info = make('info');
export const Plus = make('add');
export const RotateCcw = make('restart_alt');
export const RotateCw = make('refresh');
export const Search = make('search');
export const Send = make('send');
export const Shield = make('shield');
export const Sliders = make('tune');
export const SlidersHorizontal = make('tune');
export const Sparkles = make('auto_awesome');
export const Tag = make('sell');
export const TrendingUp = make('trending_up');
export const User = make('person');
export const UserCheck = make('how_to_reg');
export const UserPlus = make('person_add');
export const Users = make('groups');
export const X = make('close');
export const Zap = make('bolt');
