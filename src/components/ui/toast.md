# Toast Component

A dynamic, reusable toast notification component with five types: success, info, warning, error, and resend. Now supports GIF icons and automatic translations!

## Features

- ✅ Five toast types: success, info, warning, error, resend
- ✅ GIF Icons: Animated icons for each toast type
- ✅ Automatic Translations: Built-in support for English and Arabic
- ✅ Configurable positioning (top/bottom)
- ✅ Smooth animations with falling/visible/exiting states
- ✅ Progress bar that decreases over time
- ✅ Auto-dismiss functionality
- ✅ Customizable duration
- ✅ Global state management
- ✅ TypeScript support

## Usage

### Translation-based Usage (Recommended)

```tsx
import { useToastContext } from "@/components/providers/toast-provider";

function MyComponent() {
  const { showSuccess, showInfo, showWarning, showError, showResend } =
    useToastContext();

  const handleSuccess = () => {
    // Uses automatic translations based on current locale
    showSuccess();
  };

  const handleInfo = () => {
    // Uses automatic translations based on current locale
    showInfo();
  };

  const handleWarning = () => {
    // Uses automatic translations based on current locale
    showWarning();
  };

  const handleError = () => {
    // Uses automatic translations based on current locale
    showError();
  };

  const handleResend = () => {
    // Uses automatic translations based on current locale
    showResend();
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleInfo}>Show Info</button>
      <button onClick={handleWarning}>Show Warning</button>
      <button onClick={handleError}>Show Error</button>
      <button onClick={handleResend}>Show Resend</button>
    </div>
  );
}
```

### Custom Message Usage

```tsx
import { useToastContext } from "@/components/providers/toast-provider";

function MyComponent() {
  const { showToast } = useToastContext();

  const handleCustomToast = () => {
    showToast(
      "resend", // type: "success" | "info" | "warning" | "error" | "resend"
      "Custom Message", // message (optional - if not provided, uses translation)
      "Custom description", // description (optional - if not provided, uses translation)
      "bottom", // position: "top" | "bottom" (optional, default: "top")
      5000 // duration in ms (optional, default: 3300)
    );
  };

  return <button onClick={handleCustomToast}>Show Custom Toast</button>;
}
```

## Toast Types

### Success Toast

- **Icon**: Animated success GIF
- **Background**: Green gradient
- **Progress Bar**: Green gradient
- **Use Case**: Successful operations, confirmations
- **Translation**: "Welcome, Omar!" / "حياك الله، عمر!"

### Info Toast

- **Icon**: Animated account creation GIF
- **Background**: Blue gradient
- **Progress Bar**: Blue gradient
- **Use Case**: General information, account creation
- **Translation**: "Congratulations!" / "مبروك!"

### Warning Toast

- **Icon**: Animated notification GIF
- **Background**: Yellow gradient
- **Progress Bar**: Yellow gradient
- **Use Case**: Warnings, notifications
- **Translation**: "You will receive notifications!" / "راح توصلك تنبيهات!"

### Error Toast

- **Icon**: Animated error GIF
- **Background**: Red gradient
- **Progress Bar**: Red gradient
- **Use Case**: Errors, failures
- **Translation**: "An error occurred!" / "صار خطأ!"

### Resend Toast

- **Icon**: Animated resend GIF
- **Background**: Cyan gradient
- **Progress Bar**: Cyan gradient
- **Use Case**: OTP resend confirmations, message sent notifications
- **Translation**: "The verification code has been sent again!" / "تم إرسال رمز التحقق من جديد!"

## Translations

The toast component automatically uses translations based on the current locale. Translations are defined in:

- **English**: `messages/en.json` under the `Toast` section
- **Arabic**: `messages/ar.json` under the `Toast` section

### Translation Structure

```json
{
  "Toast": {
    "success": {
      "message": "Welcome, Omar!",
      "description": "You have successfully logged in, happy shopping!"
    },
    "info": {
      "message": "Congratulations!",
      "description": "Your account has been successfully created."
    },
    "warning": {
      "message": "You will receive notifications!",
      "description": "We will notify you as soon as the product is available."
    },
    "error": {
      "message": "An error occurred!",
      "description": "We couldn't connect to the server currently."
    },
    "resend": {
      "message": "The verification code has been sent again!",
      "description": "It has been sent to your registered mobile number."
    }
  }
}
```

## Positioning

### Top Position (Default)

- Toast appears at the top of the screen
- Falls from above
- Exits upward

### Bottom Position

- Toast appears at the bottom of the screen
- Rises from below
- Exits downward

## Animation

The toast component includes smooth animations:

1. **Falling/Rising**: Toast moves from off-screen to visible position
2. **Visible**: Toast stays visible with progress bar decreasing
3. **Exiting**: Toast moves back off-screen when progress reaches 0%

## Progress Bar

- Automatically decreases from 100% to 0% over the specified duration
- Color matches the toast type
- Smooth animation using requestAnimationFrame

## Configuration

### Duration

- Default: 3300ms (3.3 seconds)
- Customizable per toast call
- Includes 300ms for falling/rising animation

### Styling

- Responsive design (390px width)
- Rounded corners
- Shadow and backdrop blur
- Gradient backgrounds
- Smooth transitions
- GIF icons (32x32px)

## Integration

The toast component is already integrated into the app via the `ToastProvider` in `src/app/provider/provider.tsx`. You can use it anywhere in your app by importing the `useToastContext` hook.

## Example Implementation

See `src/components/examples/toast-example.tsx` for a complete example of all toast types and configurations, including both translation-based and custom message examples.
