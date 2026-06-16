// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { describe, expect, it } from 'vitest';

import { Toast } from './toast';

describe('Toast', () => {
  it('shows a message dispatched through sonner', async () => {
    render(<Toast />);

    toast('Career saved');

    await waitFor(() =>
      expect(screen.getByText('Career saved')).toBeInTheDocument(),
    );
  });
});
