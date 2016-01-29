#!/usr/bin/env python

import numpy as np
import ujson as json

def main():
    nside = 4
    npix = 12 * nside*nside
    pixval = np.random.random(npix)

    print json.dumps({
        'nside': nside,
        'order': 'nest',
        'vmin': np.min(pixval),
        'vmax': np.max(pixval),
        'pixval': np.round(pixval, decimals=2).tolist()
    })

    return 0

if __name__ == '__main__':
    main()
