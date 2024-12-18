import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

export const ThemeSwitcher = () => {
  const { setTheme } = useTheme();
  const [isEnabled, setIsEnabled] = useState(false);

  const handleToggle = (checked: boolean) => {
    setIsEnabled(checked);
    if (checked) {
      setTheme('Light')
    } else {
      setTheme('Dark')
    }
  }

  return (
    <div className="bg-accent p-4 flex items-center space-x-2 relative z-10">
      <Switch
        onCheckedChange={handleToggle}>
      </Switch>
      <Label className='text-text text-xs'>
        {isEnabled ? 'Dark Mode' : 'Light Mode'}
      </Label>
    </div>
  );
};