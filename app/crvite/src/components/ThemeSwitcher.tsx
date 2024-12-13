import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

export const ThemeSwitcher = () => {
  const { currentTheme, setTheme } = useTheme();
  const [isEnabled, setIsEnabled] = useState(false);

  const handleToggle = (checked: boolean) => {
    setIsEnabled(checked);
    if (checked) {
      setTheme('Dark')
    } else {
      setTheme('Light')
    }
  }

  return (
    <div className="flex items-center space-x-2 p-1 h-10 m-2">
      <Switch
        onCheckedChange={handleToggle}>
      </Switch>
      <Label className='text-text text-xs'>
        {isEnabled ? 'Light Mode' : 'Dark Mode'}
      </Label>
    </div>
  );
};